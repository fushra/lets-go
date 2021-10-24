import execa from 'execa'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import Listr, { ListrTask, ListrTaskWrapper } from 'listr'
import { dirname, isAbsolute, join } from 'path'
import { activeDir } from '../cli'
import { BasePlugin } from '../plugins/base'

export enum Category {
  WEB,
  NODE,
  LIBRARY,
}

export const staticFolder = join(__dirname, 'static')

export abstract class Step {
  abstract name: string

  abstract apply(task: ListrTaskWrapper<any>): void | Promise<void>

  abstract clone(): Step
}

export class Group extends Step {
  steps: Step[]
  name: string

  constructor(name: string, ...steps: Step[]) {
    super()

    this.steps = steps
    this.name = name
  }

  async apply(task: ListrTaskWrapper<any>) {
    for (const step of this.steps) {
      task.output = `${step.name}...`
      await step.apply(task)
    }
  }

  updateSteps(steps: Step[]): Group {
    this.steps = steps
    return this
  }

  clone(): Group {
    return new Group(this.name, ...this.steps.map((step) => step.clone()))
  }
}

/**
 * You should put all of your file creation in this to make it easier for plugins
 * to hook into the process.
 */
export class CreateFiles extends Group {
  constructor(...steps: Step[]) {
    super('Create files', ...steps)
  }
}

export class File extends Step {
  name = 'Creating file'

  destination: string
  source: string

  constructor(source: string, destination: string) {
    super()

    this.source = source
    this.destination = destination
  }

  apply(task: ListrTaskWrapper<any>) {
    const source = this.resolveSource()
    const destination = this.resolveDestination()

    const parent = dirname(destination)
    mkdirSync(parent, { recursive: true })

    writeFileSync(destination, readFileSync(source, 'utf8'))
  }

  clone(): File {
    return new File(this.source, this.destination)
  }

  resolveDestination(): string {
    return join(activeDir, this.destination)
  }

  resolveSource(): string {
    return join(staticFolder, this.source)
  }
}

export class Command extends Step {
  name: string
  command: string
  args: string[]

  constructor(name: string, command: string, ...args: string[]) {
    super()

    this.name = name
    this.command = command
    this.args = args
  }

  async apply(task: ListrTaskWrapper<any>) {
    await execa(this.command, this.args, { cwd: activeDir })
  }

  clone(): Command {
    return new Command(this.name, this.command, ...this.args)
  }
}

export class NPMInstall extends Command {
  deps: string[]
  dev: boolean

  constructor(dev: boolean, ...deps: string[]) {
    super('Installing dependencies', 'npm', 'install')

    this.dev = dev
    this.deps = deps
  }

  async apply(task: ListrTaskWrapper<any>) {
    // Skip if there are no dependencies
    if (this.deps.length === 0) return

    this.args = [...this.args, ...this.deps, this.dev ? '--save-dev' : '--save']

    await super.apply(task)
  }

  updateDeps(deps: string[]): NPMInstall {
    this.deps = deps
    return this
  }

  clone(): NPMInstall {
    return new NPMInstall(this.dev, ...this.deps)
  }
}

export class PackageMods extends Step {
  name = 'Modify package.json'
  mergeFn: (obj: any) => any

  constructor(mergeFn: (obj: any) => any) {
    super()

    this.mergeFn = mergeFn
  }

  apply(task: ListrTaskWrapper<any>) {
    const packageJson = JSON.parse(
      readFileSync(join(activeDir, 'package.json'), 'utf8')
    )
    const newPackage = this.mergeFn(packageJson)
    writeFileSync(
      join(activeDir, 'package.json'),
      JSON.stringify(newPackage, null, 2)
    )
  }

  clone(): PackageMods {
    return new PackageMods(this.mergeFn)
  }
}

export abstract class TemplateBase {
  abstract name: string
  protected abstract category: Category[]

  steps: Step[] = []

  public isInCategory(category: Category) {
    return this.category.includes(category)
  }

  prePlugins() {}

  async apply(plugins: BasePlugin<TemplateBase>[]) {
    const list = new Listr([
      {
        title: 'Pre-plugins',
        task: async (_ctx: never, task: ListrTaskWrapper<any>) =>
          this.prePlugins(),
      },
      {
        title: 'Apply plugins',
        task: async (_ctx: never, task: ListrTaskWrapper<any>) => {
          for (const plugin of plugins) {
            task.output = `${plugin.name}...`
            await plugin.apply(this)
          }
        },
      },
      {
        title: 'Build projects',
        task: () =>
          new Listr(
            this.steps.map((step) => ({
              title: step.name,
              task: (_ctx: never, task: ListrTaskWrapper<any>) =>
                step.apply(task),
            }))
          ),
      },
    ])

    await list.run().catch((err) => {
      console.error(err)
      process.exit(1)
    })
  }
}

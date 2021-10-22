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
  name = 'Creating'

  path: string
  content: string

  constructor(path: string, content: string) {
    super()

    this.path = path
    this.content = content
  }

  apply(task: ListrTaskWrapper<any>) {
    this.path = join(activeDir, this.path)

    const parent = dirname(this.path)
    mkdirSync(parent, { recursive: true })

    writeFileSync(this.path, this.content)
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
    const steps = this.steps.map((step) => ({
      title: step.name,
      task: (_ctx: never, task: ListrTaskWrapper<any>) => step.apply(task),
    }))

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
      ...steps,
    ])

    await list.run().catch((err) => {
      console.error(err)
      process.exit(1)
    })
  }
}

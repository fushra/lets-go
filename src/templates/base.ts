import execa from 'execa'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import Listr, { ListrTaskWrapper } from 'listr'
import { dirname, join } from 'path'

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

export class IfExists extends Group {
  path: string

  constructor(path: string, name: string, ...steps: Step[]) {
    super(name, ...steps)
    this.path = path
  }

  async apply(task: ListrTaskWrapper<any>) {
    if (existsSync(this.path)) {
      await super.apply(task)
    }
  }

  clone(): IfExists {
    return new IfExists(
      this.path,
      this.name,
      ...this.steps.map((step) => step.clone())
    )
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

  appendArgs(...args: string[]): Command {
    this.args = [...this.args, ...args]
    return this
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

export class SetupNPM extends Group {
  constructor(fullDeps: string[], devDeps: string[]) {
    super(
      'Setup NPM',
      new Command('Init npm', 'npm', 'init', '-y'),
      new NPMInstall(false, ...fullDeps),
      new NPMInstall(true, ...devDeps)
    )
  }
}

export class FileMod extends Step {
  name: string
  path: string
  mergeFn: (obj: string) => string

  constructor(name: string, path: string, mergeFn: (obj: string) => string) {
    super()

    this.mergeFn = mergeFn
    this.name = name
    this.path = path
  }

  apply(task: ListrTaskWrapper<any>) {
    const file = readFileSync(join(activeDir, this.path), 'utf8')
    const newFile = this.mergeFn(file)

    writeFileSync(join(activeDir, this.path), newFile)
  }

  clone(): FileMod {
    return new FileMod(this.name, this.path, this.mergeFn)
  }
}

export class JSONMod extends Step {
  name: string
  path: string
  mergeFn: (obj: any) => any

  constructor(name: string, path: string, mergeFn: (obj: any) => any) {
    super()

    this.mergeFn = mergeFn
    this.name = name
    this.path = path
  }

  apply(task: ListrTaskWrapper<any>) {
    const packageJson = JSON.parse(
      readFileSync(join(activeDir, this.path), 'utf8')
    )
    const newPackage = this.mergeFn(packageJson)
    writeFileSync(
      join(activeDir, this.path),
      JSON.stringify(newPackage, null, 2)
    )
  }

  clone(): JSONMod {
    return new JSONMod(this.name, this.path, this.mergeFn)
  }
}

export class PackageMods extends JSONMod {
  constructor(mergeFn: (obj: any) => any) {
    super('Modify package.json', 'package.json', mergeFn)
  }

  clone(): PackageMods {
    return new PackageMods(this.mergeFn)
  }
}

export abstract class TemplateBase {
  abstract name: string
  protected abstract category: Category[]

  steps: Step[] = []
  requiredPlugins: BasePlugin<TemplateBase>[] = []

  public isInCategory(category: Category) {
    return this.category.includes(category)
  }

  prePlugins() {}

  async apply(userPlugins: BasePlugin<TemplateBase>[]) {
    const plugins = [...this.requiredPlugins, ...userPlugins].sort(
      (a, b) => a.priority - b.priority
    )

    const list = new Listr([
      {
        title: 'Pre-plugins',
        task: async (_ctx: never, task: ListrTaskWrapper<any>) =>
          this.prePlugins(),
      },
      {
        title: 'Apply plugins',
        task: async (_ctx: never, task: ListrTaskWrapper<any>) => {
          await applyPlugins(plugins, task, this)
        },
      },
      {
        title: 'Build project',
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

const appliedPlugins: string[] = []

async function applyPlugins(
  plugins: BasePlugin<TemplateBase>[],
  task: Listr.ListrTaskWrapper<any>,
  parent: TemplateBase
) {
  for (const plugin of plugins
    .filter((p) => !appliedPlugins.includes(p.name))
    .sort((a, b) => a.priority - b.priority)) {
    await applyPlugins(plugin.dependencies, task, parent)

    task.output = `${plugin.name}...`
    await plugin.apply(parent)

    appliedPlugins.push(plugin.name)
  }
}

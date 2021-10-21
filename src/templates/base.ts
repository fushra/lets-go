import execa from 'execa'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import Listr, { ListrTask, ListrTaskWrapper } from 'listr'
import { dirname, isAbsolute, join } from 'path'
import { activeDir } from '../cli'

export enum Category {
  WEB,
  NODE,
  LIBRARY,
}

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

  async apply() {
    const steps = this.steps.map((step) => ({
      title: step.name,
      task: (_ctx: never, task: ListrTaskWrapper<any>) => step.apply(task),
    }))

    const list = new Listr(steps)

    await list.run().catch((err) => {
      console.error(err)
      process.exit(1)
    })
  }
}

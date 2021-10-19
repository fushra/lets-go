import { TemplateBase } from '../templates/base'

export abstract class BasePlugin<T extends TemplateBase> {
  abstract name: string
  protected abstract supports: T[]

  supportsTemplate(template: TemplateBase): boolean {
    return this.supports.some((t) => t.name === template.name)
  }

  abstract apply(template: T): void | Promise<void>
}

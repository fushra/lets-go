import prompts, { PromptObject } from 'prompts'

import { TemplateBase } from '../templates/base'

export abstract class BasePlugin<T extends TemplateBase> {
  abstract name: string
  /**
   * Higher priority plugins should be executed first
   */
  priority = 0

  dependencies: BasePlugin<T>[] = []

  protected abstract supports: T[]

  protected userChoices: PromptObject<'plugins'>[] = []

  async requestUserChoices() {
    if (this.userChoices.length == 0) return

    const choices = await prompts(this.userChoices).catch(() => process.exit(0))

    for (const key in choices) {
      ;(this as any)[key] = (choices as any)[key]
    }
  }

  supportsTemplate(template: TemplateBase): boolean {
    return this.supports.some((t) => t.name === template.name)
  }

  abstract apply(template: T): void | Promise<void>
}

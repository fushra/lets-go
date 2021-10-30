import fetch from 'node-fetch'
import { allTemplates } from '../templates'
import {
  Group,
  NPMInstall,
  PackageMods,
  StringFiles,
  TemplateBase,
} from '../templates/base'
import { BasePlugin } from './base'

export class PrettierPlugin extends BasePlugin<TemplateBase> {
  name: string = 'Prettier Plugin'

  protected supports: TemplateBase[] = allTemplates

  protected userChoices: any[] = [
    {
      type: 'select',
      name: 'prettierConfig',
      message: 'Prettier Config',
      choices: [
        { title: 'Prettier default', value: 'prettier' },
        { title: 'Fushra default', value: 'fushra' },
      ],
    },
  ]

  async apply(template: TemplateBase) {
    const fushraConfig = await (
      await fetch(
        'https://raw.githubusercontent.com/fushra/config/main/.prettierrc'
      )
    ).text()

    template.steps.push(
      new Group(
        'Prettier',
        new NPMInstall(true, '--save-exact', 'prettier'),
        new StringFiles(
          '.prettierrc',
          (this as any).prettierConfig == 'prettier' ? '{}' : fushraConfig
        ),
        new PackageMods((obj) => {
          obj.scripts = {}
          obj.scripts = 'prettier --write .'

          return obj
        })
      )
    )
  }
}

import templates from '../templates'
import { Group, NPMInstall, PackageMods } from '../templates/base'
import { ReactApp } from '../templates/react'
import { BasePlugin } from './base'
import { React } from './common'

export class CracoPlugin extends BasePlugin<React> {
  name: string = 'Craco build'
  priority = 10

  protected supports: ReactApp[] = [templates.ReactApp]

  apply(template: ReactApp): void | Promise<void> {
    template.steps.push(
      new Group(
        'Craco',

        new NPMInstall(false, '@craco/craco'),
        new PackageMods((obj) => {
          obj.scripts.build = 'craco build'
          obj.scripts.start = 'craco start'
          obj.scripts.test = 'craco test'

          return obj
        })
      )
    )
  }
}

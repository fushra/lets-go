import { Command } from 'commander'
import { mkdirSync } from 'fs'
import { isAbsolute, join } from 'path'
import prompts from 'prompts'

import { allPlugins } from './plugins'
import { BasePlugin } from './plugins/base'
import templates, { allTemplates } from './templates'
import { Category, TemplateBase } from './templates/base'
import { info } from './utils/console'

const packageJSON = require('../package.json')

export let activeDir: string

// Use injected values in development
if (process.env.NODE_ENV === 'development') {
  console.log('Using injected values')
  prompts.inject([Category.NODE, templates.CLIApp, []])
}

const program = new Command()
program
  .version(packageJSON.version)
  .arguments('[directory]')
  .action(async (directory = process.cwd()) => {
    if (!isAbsolute(directory)) {
      activeDir = join(process.cwd(), directory)
    } else {
      activeDir = directory
    }

    info(`Creating new project in ${activeDir}`)

    const { category } = await prompts({
      type: 'select',
      name: 'category',
      message: 'What best fits the platform you are creating for?',
      initial: 1,
      choices: [
        {
          title: 'Web',
          value: Category.WEB,
        },
        {
          title: 'Node',
          value: Category.NODE,
        },
        {
          title: 'Library',
          value: Category.LIBRARY,
        },
      ],
    }).catch(() => process.exit(0))

    if (typeof category === 'undefined') process.exit(0)

    const { template } = (await prompts({
      type: 'select',
      name: 'template',
      message: 'Chose a base template',
      initial: 1,
      choices: allTemplates
        .filter((template) => template.isInCategory(category))
        .map((template) => ({ title: template.name, value: template })),
    }).catch(() => process.exit(0))) as { template: TemplateBase }

    if (typeof template === 'undefined') process.exit(0)

    let plugins: BasePlugin<TemplateBase>[] = []

    const availablePlugins = allPlugins
      .filter((plugin) => plugin.supportsTemplate(template))
      .map((plugin) => ({ title: plugin.name, value: plugin }))

    if (availablePlugins.length !== 0) {
      const userInput = (await prompts({
        type: 'multiselect',
        name: 'plugins',
        message: 'Chose plugins',
        choices: availablePlugins,
      }).catch(() => process.exit(0))) as {
        plugins: BasePlugin<TemplateBase>[]
      }

      plugins = userInput.plugins
    }

    mkdirSync(activeDir, { recursive: true })

    await template.apply(plugins || [])
  })

program.parse(process.argv)

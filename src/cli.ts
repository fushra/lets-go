import { Command } from 'commander'
import { isAbsolute, join } from 'path'
import prompts from 'prompts'
import { allPlugins } from './plugins'
import templates, { allTemplates } from './templates'
import { Category } from './templates/base'

const packageJSON = require('../package.json')

export let activeDir: string

console.log(`test`)

// Use injected values in development
if (process.env.NODE_ENV === 'development') {
  console.log('Using injected values')
  prompts.inject([Category.NODE, templates.ExpressApp, []])
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

    console.log(`Creating new project in ${activeDir}`)

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

    const { template } = await prompts({
      type: 'select',
      name: 'template',
      message: 'Chose a base template',
      initial: 1,
      choices: allTemplates
        .filter((template) => template.isInCategory(category))
        .map((template) => ({ title: template.name, value: template })),
    }).catch(() => process.exit(0))

    if (typeof template === 'undefined') process.exit(0)

    const { plugins } = await prompts({
      type: 'multiselect',
      name: 'plugins',
      message: 'Chose plugins',
      choices: allPlugins
        .filter((plugin) => plugin.supportsTemplate(template))
        .map((plugin) => ({ title: plugin.name, value: plugin })),
    }).catch(() => process.exit(0))

    if (typeof plugins === 'undefined') process.exit(0)

    template.prePlugins()

    // Apply plugins to template
    for (const plugin of plugins) {
      await plugin.apply(template)
    }

    template.apply()
  })

program.parse(process.argv)

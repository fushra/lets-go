import prompts, { PromptObject } from 'prompts'
import { allPlugins } from './plugins'
import { BasePlugin } from './plugins/base'
import { allTemplates } from './templates'
import { Category, TemplateBase } from './templates/base'
;(async () => {
  const { category } = await prompts({
    type: 'select',
    name: 'category',
    message: 'What best fits the platform you are creating for?',
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
  })

  const { template } = await prompts({
    type: 'select',
    name: 'template',
    message: 'Chose a base template',
    choices: allTemplates
      .filter((template) => template.isInCategory(category))
      .map((template) => ({ title: template.name, value: template })),
  })

  const { plugins } = await prompts({
    type: 'multiselect',
    name: 'plugins',
    message: 'Chose plugins',
    choices: allPlugins
      .filter((plugin) => plugin.supportsTemplate(template))
      .map((plugin) => ({ title: plugin.name, value: plugin })),
  })

  // Apply plugins to template
  for (const plugin of plugins) {
    await plugin.apply(template)
  }
})()

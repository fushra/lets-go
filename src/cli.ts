import prompts, { PromptObject } from 'prompts'
import { allTemplates } from './templates'
import { Category } from './templates/base'
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
})()

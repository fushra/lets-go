import { plugins } from '.'
import templates from '../templates'
import {
  Command,
  Group,
  NPMInstall,
  File,
  FileMod,
  IfExists,
} from '../templates/base'
import { ReactApp } from '../templates/react'
import { BasePlugin } from './base'
import { React } from './common'
import { CracoPlugin } from './craco'

export class TailwindReactPlugin extends BasePlugin<React> {
  name: string = 'Tailwind (React)'
  protected supports: ReactApp[] = [templates.ReactApp]

  dependencies = [new CracoPlugin()]

  apply(template: ReactApp): void | Promise<void> {
    template.steps.push(
      new Group(
        'Setup tailwind',

        new NPMInstall(
          true,
          'tailwindcss@npm:@tailwindcss/postcss7-compat',
          'postcss@^7',
          'autoprefixer@^9'
        ),
        new File('react/craco.config.js', 'craco.config.js'),
        new Command('Creating config', 'npx', 'tailwindcss-cli@latest', 'init'),
        new File('react/src/index.css', 'src/index.css'),
        new FileMod('Purge unused styles', 'tailwind.config.js', (file) =>
          file.replace(
            'purge: []',
            "purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html']"
          )
        ),
        new IfExists(
          'src/index.js',
          'Add styles to index.js',
          new FileMod(
            'Add styles to index.js',
            'index.js',
            (file) => `import './index.css';\n\n${file}`
          )
        ),
        new IfExists(
          'src/index.ts',
          'Add styles to index.ts',
          new FileMod(
            'Add styles to index.ts',
            'index.ts',
            (file) => `import './index.css';\n\n${file}`
          )
        )
      )
    )
  }
}

import { readFileSync } from 'fs'
import { join } from 'path'
import {
  Category,
  Command,
  File,
  Group,
  PackageMods,
  TemplateBase,
} from './base'

export class ExpressApp extends TemplateBase {
  name = 'Express Web Server'
  protected category = [Category.NODE, Category.WEB]

  steps = [
    new Group(
      'Setup NPM',

      new Command('Init npm', 'npm', 'init', '-y'),
      new Command('Install express', 'npm', 'install', 'express'),
      new Command('Install node-dev', 'npm', 'install', '-D', 'node-dev')
    ),
    new Group(
      'Create files',

      new File(
        'src/index.js',
        readFileSync(join(__dirname, 'static', 'express-src-index.js'), 'utf8')
      ),
      new PackageMods((obj) => {
        if (!obj.scripts) obj.scripts = {}

        obj.scripts.prod = 'node ./src/index.js'
        obj.scripts.dev = 'node-dev ./src/index.js'

        obj.main = 'src/index.js'
        obj.private = false

        return obj
      })
    ),
  ]
}

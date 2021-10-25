import { readFileSync } from 'fs'
import { join } from 'path'
import {
  Category,
  Command,
  CreateFiles,
  File,
  Group,
  NPMInstall,
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
      new NPMInstall(false, 'express'),
      new NPMInstall(true, 'node-dev')
    ),
    new CreateFiles(
      new File('express/src/index.js', 'src/index.js'),
      new PackageMods((obj) => {
        if (!obj.scripts) obj.scripts = {}

        obj.scripts.prod = 'node ./src/index.js'
        obj.scripts.dev = 'node-dev ./src/index.js'

        obj.main = 'src/index.js'
        obj.private = true

        return obj
      })
    ),
  ]
}

import {
  File,
  Category,
  CreateFiles,
  TemplateBase,
  PackageMods,
  Step,
  SetupNPM,
} from './base'

export class CLIApp extends TemplateBase {
  name = 'CLI App'
  protected category = [Category.NODE]

  steps: Step[] = [
    new SetupNPM(['commander'], ['node-dev']),
    new CreateFiles(
      new File('cli/src/index.js', 'src/index.js'),
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

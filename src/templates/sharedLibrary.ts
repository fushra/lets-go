import {
  Category,
  CreateFiles,
  PackageMods,
  TemplateBase,
  File,
  SetupNPM,
} from './base'

export class SharedCommonJSLibrary extends TemplateBase {
  name = 'Shared CommonJS Library'
  protected category = [Category.LIBRARY, Category.NODE, Category.WEB]

  steps = [
    new SetupNPM([], []),
    new CreateFiles(
      new File('cjslib/src/index.js', 'src/index.js'),
      new PackageMods((obj) => {
        obj.main = 'src/index.js'

        return obj
      })
    ),
  ]
}

export class SharedESMLibrary extends TemplateBase {
  name = 'Shared ESM Library'
  protected category = [Category.LIBRARY, Category.NODE, Category.WEB]

  steps = [
    new SetupNPM([], []),
    new CreateFiles(
      new File('esmlib/src/index.js', 'src/index.js'),
      new PackageMods((obj) => {
        obj.main = 'src/index.js'

        return obj
      })
    ),
  ]
}

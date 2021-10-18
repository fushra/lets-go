import { Category, TemplateBase } from './base'

export class SharedLibrary extends TemplateBase {
  name = 'Shared Library'
  protected category = [Category.LIBRARY, Category.NODE, Category.WEB]
}

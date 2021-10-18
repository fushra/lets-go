import { Category, TemplateBase } from './base'

export class ExpressApp extends TemplateBase {
  name = 'Express Web Server'
  protected category = [Category.NODE, Category.WEB]
}

import { Category, Command, TemplateBase } from './base'

export class ReactApp extends TemplateBase {
  name = 'React Webapp'
  protected category = [Category.WEB]

  steps = [new Command('Create react app', 'npx', 'create-react-app', '.')]
}

import { Category, Command, Step, TemplateBase } from './base'

export class ReactApp extends TemplateBase {
  name = 'React Webapp'
  protected category = [Category.WEB]

  steps: Step[] = [
    new Command('Create react app', 'npx', 'create-react-app', '.'),
  ]
}

import { TemplateBase } from './base'
import { CLIApp } from './cliApp'
import { ExpressApp } from './expressApp'
import { ReactApp } from './react'
import { SharedCommonJSLibrary, SharedESMLibrary } from './sharedLibrary'

export const templates = {
  CLIApp: new CLIApp(),
  ExpressApp: new ExpressApp(),
  ReactApp: new ReactApp(),
  SharedCommonJSLibrary: new SharedCommonJSLibrary(),
  SharedESMLibrary: new SharedESMLibrary(),
}

export const allTemplates: TemplateBase[] = [
  templates.CLIApp,
  templates.ExpressApp,
  templates.ReactApp,
  templates.SharedCommonJSLibrary,
  templates.SharedESMLibrary,
]

export default templates

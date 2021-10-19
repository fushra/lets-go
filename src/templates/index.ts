import { TemplateBase } from './base'
import { CLIApp } from './cliApp'
import { ExpressApp } from './expressApp'
import { ReactApp } from './react'
import { SharedLibrary } from './sharedLibrary'

export const templates = {
  CLIApp: new CLIApp(),
  ExpressApp: new ExpressApp(),
  ReactApp: new ReactApp(),
  SharedLibrary: new SharedLibrary(),
}

export const allTemplates: TemplateBase[] = [
  templates.CLIApp,
  templates.ExpressApp,
  templates.ReactApp,
  templates.SharedLibrary,
]

export default templates

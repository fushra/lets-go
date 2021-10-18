import { TemplateBase } from './base'
import { CLIApp } from './cliApp'
import { ExpressApp } from './expressApp'
import { ReactApp } from './react'
import { SharedLibrary } from './sharedLibrary'

export const allTemplates: TemplateBase[] = [
  new CLIApp(),
  new ExpressApp(),
  new ReactApp(),
  new SharedLibrary(),
]
export default { CLIApp, ExpressApp, ReactApp, SharedLibrary }

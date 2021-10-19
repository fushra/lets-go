import templates from '../templates'
import { CLIApp } from '../templates/cliApp'
import { ExpressApp } from '../templates/expressApp'
import { ReactApp } from '../templates/react'
import { SharedLibrary } from '../templates/sharedLibrary'

import { BasePlugin } from './base'

type Base = CLIApp | ExpressApp | SharedLibrary

export class TypescriptBasePlugin extends BasePlugin<Base> {
  name = 'Typescript'
  protected supports = [
    templates.CLIApp,
    templates.ExpressApp,
    templates.SharedLibrary,
  ]

  apply(template: Base) {
    throw new Error('Method not implemented.')
  }
}

type React = ReactApp

export class TypescriptReactPlugin extends BasePlugin<React> {
  name = 'Typescript (React)'
  protected supports = [templates.ReactApp]

  apply(template: React) {
    throw new Error('Method not implemented.')
  }
}

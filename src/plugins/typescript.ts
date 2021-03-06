import { existsSync } from 'fs'
import fetch from 'node-fetch'

import templates from '../templates'
import {
  CreateFiles,
  Group,
  File,
  Command,
  PackageMods,
  NPMInstall,
  JSONMod,
} from '../templates/base'
import { CLIApp } from '../templates/cliApp'
import { ExpressApp } from '../templates/expressApp'
import { SharedCommonJSLibrary } from '../templates/sharedLibrary'

import { BasePlugin } from './base'
import { flattenSteps, mapAllSteps, React } from './common'

type Base = CLIApp | ExpressApp | SharedCommonJSLibrary

export class TypescriptBasePlugin extends BasePlugin<Base> {
  name = 'Typescript'
  priority = 10
  protected supports = [
    templates.CLIApp,
    templates.ExpressApp,
    templates.SharedCommonJSLibrary,
  ]

  async apply(template: Base) {
    const filesIndex = template.steps.findIndex(
      (step) => step.name == 'Create files'
    )

    // Convert all the files into typescript files
    this.convertFilesToTs(template, filesIndex)

    // Remove node-dev from install list
    template.steps = mapAllSteps(template.steps, (step) =>
      step instanceof NPMInstall
        ? step.updateDeps(step.deps.filter((dep) => dep != 'node-dev'))
        : step
    )

    // Check for dependencies that need types
    let toInstall = await this.getTypes(template)

    // Add a step that will generate the tsconfig.json file
    this.addSteps(template, toInstall)
  }

  private addSteps(template: Base, toInstall: string[]) {
    template.steps.push(
      new Group(
        'Setup typescript',

        new NPMInstall(true, 'typescript', 'ts-node-dev'),
        new NPMInstall(true, '@types/node', ...toInstall),
        new Command('Create tsconfig', 'npx', 'tsc', '--init'),
        new PackageMods((obj) => {
          if (!obj.scripts) obj.scripts = {}

          obj.scripts.build = 'tsc ./src/index.ts'
          obj.scripts.prod = 'node ./dist/index.js'
          obj.scripts.dev = 'ts-node-dev ./src/index.js'

          obj.main = obj.main.replace('.js', '.ts').replace()

          return obj
        }),
        new JSONMod('Apply tsconfig changes', 'tsconfig.json', (conf) => {
          conf.outDir = './dist'
          conf.sourceMap = true
          conf.target = 'es6'

          return conf
        })
      )
    )
  }

  private async getTypes(template: Base) {
    const potentiallyNeedsTypes = (
      flattenSteps(template.steps).filter(
        (step) => step instanceof NPMInstall
      ) as NPMInstall[]
    )
      .map((step) => step.deps)
      .flat()

    let toInstall = []

    for (const dep of potentiallyNeedsTypes) {
      const res = await fetch(`https://www.npmjs.com/package/@types/${dep}`)
      if (res.status == 200) {
        toInstall.push(`@types/${dep}`)
      }
    }
    return toInstall
  }

  private convertFilesToTs(template: Base, filesIndex: number) {
    if (
      template.steps[filesIndex] instanceof CreateFiles ||
      template.steps[filesIndex] instanceof Group
    ) {
      ;(template.steps[filesIndex] as Group).steps = (
        template.steps[filesIndex] as Group
      ).steps.map((step) => {
        // We do not want to process it if it is not a file
        if (!(step instanceof File)) return step

        // We do not want to process it if it is not a js file
        if (!step.destination.includes('.js')) return step

        const newStep = step.clone()
        newStep.source = newStep.source.replace('.js', '.ts')
        newStep.destination = newStep.destination.replace('.js', '.ts')

        if (existsSync(newStep.resolveSource())) {
          return newStep
        }

        return step
      })
    } else {
      throw new Error('Create files step not found')
    }
  }
}

export class TypescriptReactPlugin extends BasePlugin<React> {
  name = 'Typescript (React)'
  priority = 10

  protected supports = [templates.ReactApp]

  apply(template: React) {
    template.steps = mapAllSteps(template.steps, (step) =>
      step.name == 'Create react app' && step instanceof Command
        ? step.appendArgs('--template', 'typescript')
        : step
    )
  }
}

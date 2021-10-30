import { CracoPlugin } from './craco'
import { PrettierPlugin } from './prettier'
import { TailwindReactPlugin } from './tailwind'
import { TypescriptBasePlugin, TypescriptReactPlugin } from './typescript'

export const plugins = {
  TypescriptBasePlugin: new TypescriptBasePlugin(),
  TypescriptReactPlugin: new TypescriptReactPlugin(),
  TailwindReactPlugin: new TailwindReactPlugin(),
  CracoPlugin: new CracoPlugin(),
  PrettierPlugin: new PrettierPlugin(),
}

export const allPlugins = [
  plugins.TypescriptBasePlugin,
  plugins.TypescriptReactPlugin,
  plugins.TailwindReactPlugin,
  plugins.CracoPlugin,
  plugins.PrettierPlugin,
]

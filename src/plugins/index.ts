import { CracoPlugin } from './craco'
import { TailwindReactPlugin } from './tailwind'
import { TypescriptBasePlugin, TypescriptReactPlugin } from './typescript'

export const plugins = {
  TypescriptBasePlugin: new TypescriptBasePlugin(),
  TypescriptReactPlugin: new TypescriptReactPlugin(),
  TailwindReactPlugin: new TailwindReactPlugin(),
  CracoPlugin: new CracoPlugin(),
}

export const allPlugins = [
  plugins.TypescriptBasePlugin,
  plugins.TypescriptReactPlugin,
  plugins.TailwindReactPlugin,
  plugins.CracoPlugin,
]

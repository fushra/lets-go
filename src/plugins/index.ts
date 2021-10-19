import { TypescriptBasePlugin, TypescriptReactPlugin } from './typescript'

export const plugins = {
  TypescriptBasePlugin: new TypescriptBasePlugin(),
  TypescriptReactPlugin: new TypescriptReactPlugin(),
}

export const allPlugins = [
  plugins.TypescriptBasePlugin,
  plugins.TypescriptReactPlugin,
]

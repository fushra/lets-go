import { Command } from 'commander'

// We need to keep this as a commonjs import to stop typescript from doing some
// funky stuff and messing up the build.
const packageJSON = require('../package.json')

const program = new Command()

program.version(packageJSON.version).addHelpCommand()

program.argument('<say>').action((say) => console.log(say))

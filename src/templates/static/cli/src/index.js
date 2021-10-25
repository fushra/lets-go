const { Command } = require('commander')

const packageJSON = require('../package.json')

const program = new Command()

program.version(packageJSON.version).addHelpCommand()

program.argument('<say>').action((say) => console.log(say))

import {Command} from './types/command'
import {commands} from './commands'
import * as core from '@actions/core'
import {OptionValues} from 'commander'

export class Invoker {
  readonly options: OptionValues
  readonly commandsList: Map<string, Command>

  constructor(options: OptionValues) {
    this.commandsList = new Map<string, Command>()
    this.options = options || null
    this.loadCommands()
  }

  /**
   * Create a new instance of each command loaded from ./commands
   * and add it to the commandsList instance variable
   */
  loadCommands() {
    core.debug(`Loading commands from ${commands.length} files`)
    commands.reduce((accumulator, command) => {
      let instance = new command(this.options)
      core.debug(`Loading command: ${instance.name()}`)
      accumulator.set(instance.name(), instance)
      return accumulator
    }, this.commandsList)
  }

  /**
   * Runs a number of checks and attemps to execute a command
   * @param {OptionValues} options
   * @returns
   */
  async executeCommand(options: OptionValues) {
    core.debug('Starting execution of command')
    // It's possible to supply an empty string as a command name so we have
    // to guard against this
    if (!options.command) {
      throw new Error(
        "required option '-c, --command <command name>' command name must be supplied"
      )
    }

    core.debug(`Attempting to read value from options.command`)
    var commandName =
      typeof options.command === typeof ''
        ? (options.command as string)
        : (options.command() as string)
    core.debug(`Command name: ${commandName}`)

    // We need to make sure the command name provided matches the name of one of
    // our loaded commands. Remember, loadCommands() uses the command name
    // as the key in the commandsList dictionary
    if (!this.commandsList.has(commandName)) {
      throw new Error(`${commandName} not found in the loaded commands`)
    }
    const command = this.commandsList.get(commandName) as Command
    return await command.execute(options)
  }
}

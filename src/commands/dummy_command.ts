import {Command} from '../types/command'
import {OptionValues} from 'commander'

export class DummyCommand extends Command {
  name(): string {
    return 'dummy_command'
  }

  validate(options: OptionValues): boolean {
    return options ? true : false
  }

  async execute(options: OptionValues): Promise<string> {
    this.validate(options)
    return JSON.stringify({
      status: 'OK'
    })
  }
}

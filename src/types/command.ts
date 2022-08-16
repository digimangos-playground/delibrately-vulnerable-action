import {OptionValues} from 'commander'

/* eslint-disable @typescript-eslint/no-unused-vars */

export class Command {
  constructor(options: OptionValues) {
    if (this.constructor === Command) {
      throw new Error("Abstract classes can't be instantiated.")
    }
  }

  name(): string {
    throw new Error("Method 'name()' must be implemented first")
  }

  validate(options: OptionValues): boolean {
    throw new Error("Method 'validate()' must be implemented first")
  }

  async execute(options: OptionValues): Promise<string> {
    throw new Error("Method 'execute()' must be implemented first")
  }
}

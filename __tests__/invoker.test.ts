import {expect, test, jest} from '@jest/globals'
import {OptionValues, program} from 'commander'
import {DummyCommand} from '../src/commands/dummy_command'
import {Invoker} from '../src/invoker'

test('Can initialise command list', async () => {
  const options = program.opts()
  options.command = new DummyCommand(options).name
  const invoker = new Invoker(options)
  expect(invoker.commandsList.keys).toContain = options.command
})

test('Can find command', async () => {
  const options: OptionValues = {
    enterprise: 'ent',
    token: 'token',
    command: 'get_repository_compliance_report',
    reporting_repository: 'owner/repo',
    config_directory: 'cd',
    exceptions_directory: 'ed'
  }
  const exec = jest
    .spyOn(DummyCommand.prototype, 'execute')
    .mockImplementation(async (options: OptionValues) => {
      return JSON.stringify({
        status: 'OK',
        output: `executed successfully 🙌`
      })
    })
  options.command = new DummyCommand(options).name()
  const invoker = new Invoker(options)
  var result = await invoker.executeCommand(options)
  expect(exec).toHaveBeenCalled()
})

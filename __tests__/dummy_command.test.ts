import {DummyCommand} from '../src/commands/dummy_command'
import {expect, test} from '@jest/globals'
import {program} from 'commander'

test('returns correct name', async () => {
  var command = new DummyCommand(program.opts)
  expect(command.name()).toEqual('dummy_command')
})

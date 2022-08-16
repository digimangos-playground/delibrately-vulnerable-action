import {Command} from 'commander'
import {Invoker} from './invoker'

const core = require('@actions/core')
const meta = require('../package.json')

const program = new Command()

/**
 * We make use of the default option to fetch the input from our action
 * with core.getInput() only when a value has not been supplied via the CLI.
 * What this means is that, if you provide these parameters the values from
 * the action will be ignored.
 *
 * This will guarantee that this tool will operate as an action but has an
 * alternative trigger via the CLI.
 */
program
  .version(meta.version)
  .name(meta.name)
  .option(
    '-c, --command <command name>',
    'Command to execute',
    core.getInput('command')
  )
  .option(
    '-t, --token <token>',
    'Personal Access Token or GITHUB_TOKEN (or comma separated tokens)',
    core.getInput('token')
  )
  .option(
    '-e, --enterprise <slug>',
    'Enterprise slug',
    core.getInput('enterprise')
  )
  .option(
    '-cd, --config_directory <config_directory>',
    'Path to directory containing configuration files (e.g. rule file)',
    core.getInput('config_directory')
  )
  .option(
    '-ex, --exceptions_directory <exceptions_directory>',
    'Path to directory containing rule exceptions',
    core.getInput('exceptions_directory')
  )
  .option(
    '-rr, --reporting_repository <owner/repo>',
    'Optional - Repository specified as Owner/Repo for final report',
    core.getInput('reporting_repository')
  )
  .option(
    '-o, --organization <organization_login>',
    'Optional - Limit to specified organization login only',
    core.getInput('organization')
  )
  .option(
    '-rd, --report_directory <path>',
    'Optional - Specifies the location to write the json report to (defaults to current directory)',
    '.'
  )
  .parse()

/**
 * await won’t work in the top-level code so we have to wrap it with an
 * anonymous async function and invoke it
 *
 * More details: https://javascript.info/async-await
 */
;(async () => {
  try {
    const options = program.opts()
    const invoker = new Invoker(options)
    const result = await invoker.executeCommand(options)
    core.setOutput('result', result)
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed(`Unknown error type. ${error}`)
    }
    core.debug(`Error details: ${JSON.stringify(error)}`)
  }
})()

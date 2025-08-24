import {Args, Command, Flags} from '@oclif/core'
import {RulesBuilder} from '../core/rules-builder.js'

export default class Generate extends Command {
  static description = 'Build coding agent rules from .rules directory'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --source ./custom/.rules',
    '<%= config.bin %> <%= command.id %> --agents claude,cursor',
  ]

  static flags = {
    source: Flags.string({
      char: 's',
      description: 'Source directory for rules',
      default: '.rules',
    }),
    agents: Flags.string({
      char: 'a',
      description: 'Comma-separated list of agents to build for',
      default: 'all',
    }),
    verbose: Flags.boolean({
      char: 'v',
      description: 'Verbose output',
      default: false,
    }),
    dry: Flags.boolean({
      description: 'Dry run (show what would be built)',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Generate)

    const builder = new RulesBuilder({
      sourceDir: flags.source,
      agents: flags.agents === 'all' ? undefined : flags.agents.split(','),
      verbose: flags.verbose,
      dryRun: flags.dry,
    })

    try {
      await builder.build()
      this.log('✅ Rules build completed successfully!')
    } catch (error) {
      this.error(`Failed to build rules: ${error}`, {exit: 1})
    }
  }
}
import {Command, Flags} from '@oclif/core'
import {existsSync} from 'node:fs'
import {join, resolve} from 'node:path'

import {ConfigLoader} from '../core/config-loader.js'
import {RulesBuilder} from '../core/rules-builder.js'

export default class Build extends Command {
  static description = 'Build coding agent rules from .rules directory'
static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --config ./custom/.aimap.yml',
    '<%= config.bin %> <%= command.id %> --agents claude,cursor',
  ]
static flags = {
    agents: Flags.string({
      char: 'a',
      description: 'Comma-separated list of agents (overrides config)',
    }),
    config: Flags.string({
      char: 'c',
      default: '.aimap.yml',
      description: 'Path to aimap config file',
    }),
    dry: Flags.boolean({
      default: false,
      description: 'Dry run (show what would be built)',
    }),
    force: Flags.boolean({
      char: 'f',
      default: false,
      description: 'Force build even if not in project root',
    }),
    source: Flags.string({
      char: 's',
      description: 'Source directory for rules (overrides config)',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Verbose output',
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Build)

    // Check if we're in project root
    const projectRoot = this.findProjectRoot()
    const currentDir = process.cwd()
    
    if (!projectRoot) {
      this.error('Not in a git repository. Initialize git first with "git init"', {exit: 1})
    }
    
    if (currentDir !== projectRoot && !flags.force) {
      this.error(`Not in project root. Run from ${projectRoot} or use --force flag`, {exit: 1})
    }

    // Load config
    const configLoader = new ConfigLoader(flags.config)
    const config = configLoader.load()

    // Override config with CLI flags
    const sourceDir = flags.source || config.source
    const agents = flags.agents ? flags.agents.split(',') : config.agents
    
    // Check if source directory exists
    if (!existsSync(sourceDir)) {
      this.error(`Source directory "${sourceDir}" does not exist. Create it first or check your configuration.`, {exit: 1})
    }

    if (configLoader.exists() && flags.verbose) {
      this.log(`📄 Using config from ${flags.config}`)
    }

    const builder = new RulesBuilder({
      agents,
      dryRun: flags.dry,
      outputs: config.outputs,
      sourceDir,
      verbose: flags.verbose,
    })

    try {
      await builder.build()
      this.log('✅ Rules build completed successfully!')
    } catch (error) {
      this.error(`Failed to build rules: ${error}`, {exit: 1})
    }
  }

  private findProjectRoot(): null | string {
    let currentDir = process.cwd()
    const root = resolve('/')
    
    while (currentDir !== root) {
      if (existsSync(join(currentDir, '.git'))) {
        return currentDir
      }

      currentDir = resolve(currentDir, '..')
    }
    
    return null
  }
}
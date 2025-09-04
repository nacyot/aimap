import {Command, Flags} from '@oclif/core'
import {existsSync} from 'node:fs'
import {join, resolve} from 'node:path'

import {ConfigLoader} from '../core/config-loader.js'
import {computeRulesHash} from '../core/rules-hash.js'

export default class Hash extends Command {
  static description = 'Print current rules hash (computed from source directory)'
  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --source .rules',
    '<%= config.bin %> <%= command.id %> --short',
  ]
  static flags = {
    config: Flags.string({
      char: 'c',
      default: '.aimap.yml',
      description: 'Path to aimap config file',
    }),
    force: Flags.boolean({
      char: 'f',
      default: false,
      description: 'Run outside project root (skip git root check)',
    }),
    short: Flags.boolean({
      char: 's',
      default: false,
      description: 'Print short hash (first 16 chars)',
    }),
    source: Flags.string({
      char: 'd',
      description: 'Source directory for rules (overrides config)',
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Hash)

    // Optional: check project root for consistency with other commands
    const projectRoot = this.findProjectRoot()
    const currentDir = process.cwd()

    if (!projectRoot) {
      this.error('Not in a git repository. Initialize git first with "git init"', {exit: 1})
    }

    if (currentDir !== projectRoot && !flags.force) {
      this.error(`Not in project root. Run from ${projectRoot} or use --force flag`, {exit: 1})
    }

    const configLoader = new ConfigLoader(flags.config)
    const config = configLoader.load()
    const sourceDir = flags.source || config.source

    if (!existsSync(sourceDir)) {
      this.error(`Source directory "${sourceDir}" does not exist.`, {exit: 1})
    }

    try {
      const {hash} = computeRulesHash(sourceDir)
      this.log(flags.short ? hash.slice(0, 16) : hash)
    } catch (error) {
      this.error(`Failed to compute rules hash: ${error}`, {exit: 1})
    }
  }

  private findProjectRoot(): null | string {
    let currentDir = process.cwd()
    const root = resolve('/')
    while (currentDir !== root) {
      if (existsSync(join(currentDir, '.git'))) return currentDir
      currentDir = resolve(currentDir, '..')
    }
    
    return null
  }
}

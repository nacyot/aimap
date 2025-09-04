import {Command, Flags} from '@oclif/core'
import {existsSync} from 'node:fs'
import {join, resolve} from 'node:path'

import {ConfigLoader} from '../core/config-loader.js'
import {compareHashes} from '../core/rules-hash.js'

export default class Check extends Command {
  static description = 'Check if a rules build is needed by comparing current hash with stored .build_hash'
  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --quiet',
    '<%= config.bin %> <%= command.id %> --source .rules',
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
    quiet: Flags.boolean({
      char: 'q',
      default: false,
      description: 'Quiet mode (exit code only: 0 up-to-date, 1 needs build)',
    }),
    source: Flags.string({
      char: 'd',
      description: 'Source directory for rules (overrides config)',
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Check)

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
      const {computed, needsBuild, stored} = compareHashes(sourceDir)
      if (!flags.quiet) {
        if (!stored) {
          this.log(`❓ No stored build hash found at ${join(sourceDir, '.build_hash')}`)
          this.log(`🧮 Current hash: ${computed}`)
          this.log('📦 Build is needed.')
        } else if (needsBuild) {
          this.log(`🧮 Current hash: ${computed}`)
          this.log(`🔒 Stored hash:  ${stored}`)
          this.log('📦 Build is needed (hash mismatch).')
        } else {
          this.log(`✅ Up-to-date. Current hash matches stored hash: ${computed}`)
        }
      }

      if (flags.quiet && needsBuild) this.exit(1)
      // In quiet mode and up-to-date, exit 0 implicitly
    } catch (error) {
      this.error(`Failed to check build status: ${error}`, {exit: 1})
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

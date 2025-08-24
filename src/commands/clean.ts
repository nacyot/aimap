import {Command, Flags} from '@oclif/core'
import {execSync} from 'node:child_process'
import {existsSync} from 'node:fs'

import {ConfigLoader} from '../core/config-loader.js'

export default class Clean extends Command {
  static description = 'Clean generated rule files'
static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --all',
  ]
static flags = {
    all: Flags.boolean({
      default: false,
      description: 'Remove all generated files including build hash',
    }),
    config: Flags.string({
      char: 'c',
      default: '.aimap.yml',
      description: 'Path to aimap config file',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Verbose output',
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Clean)

    this.log('🧹 Cleaning generated rule files...')

    // Load config to get custom output paths
    const configLoader = new ConfigLoader(flags.config)
    const config = configLoader.load()

    const filesToClean = [
      config.outputs?.claude || 'CLAUDE.md',
      config.outputs?.codex || 'AGENTS.md',
      config.outputs?.cline || '.clinerules',
      config.outputs?.roocode || '.roo',
      config.outputs?.cursor || '.cursor',
      config.outputs?.windsurf || '.windsurf',
    ]

    if (flags.all) {
      filesToClean.push(`${config.source}/.build_hash`)
    }

    let cleanedCount = 0

    for (const path of filesToClean) {
      if (existsSync(path)) {
        try {
          execSync(`rm -rf "${path}"`)
          cleanedCount++
          if (flags.verbose) {
            this.log(`   ✅ Removed ${path}`)
          }
        } catch (error) {
          this.warn(`Failed to remove ${path}: ${error}`)
        }
      } else if (flags.verbose) {
        this.log(`   ⏭️  Skipped ${path} (doesn't exist)`)
      }
    }

    if (cleanedCount > 0) {
      this.log(`✅ Cleaned ${cleanedCount} files/directories`)
    } else {
      this.log('ℹ️  Nothing to clean')
    }
  }
}
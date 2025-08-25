import {Command, Flags} from '@oclif/core'
import {existsSync, rmSync} from 'node:fs'
import {join, resolve} from 'node:path'

import {getAllAgents} from '../agents/index.js'
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
    force: Flags.boolean({
      char: 'f',
      default: false,
      description: 'Force clean even if not in project root',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Verbose output',
    }),
  }

  private findProjectRoot(): string | null {
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

  public async run(): Promise<void> {
    const {flags} = await this.parse(Clean)
    
    // Check if we're in project root
    const projectRoot = this.findProjectRoot()
    const currentDir = process.cwd()
    
    if (!projectRoot) {
      this.error('Not in a git repository. Initialize git first with "git init"', {exit: 1})
    }
    
    if (currentDir !== projectRoot && !flags.force) {
      this.error(`Not in project root. Run from ${projectRoot} or use --force flag`, {exit: 1})
    }

    this.log('🧹 Cleaning generated rule files...')

    // Load config to get source directory
    const configLoader = new ConfigLoader(flags.config)
    const config = configLoader.load()

    let cleanedCount = 0

    // Clean files for all agents using registry
    for (const agent of getAllAgents()) {
      if (agent.clean) {
        try {
          agent.clean()
          cleanedCount++
          if (flags.verbose) {
            this.log(`   ✅ Cleaned ${agent.displayName} outputs`)
          }
        } catch (error) {
          this.warn(`Failed to clean ${agent.displayName}: ${error}`)
        }
      } else {
        // Fallback to default clean for agents without custom clean
        for (const outputPath of agent.outputPaths) {
          if (existsSync(outputPath)) {
            try {
              rmSync(outputPath, {force: true, recursive: true})
              cleanedCount++
              if (flags.verbose) {
                this.log(`   ✅ Removed ${outputPath}`)
              }
            } catch (error) {
              this.warn(`Failed to remove ${outputPath}: ${error}`)
            }
          } else if (flags.verbose) {
            this.log(`   ⏭️  Skipped ${outputPath} (doesn't exist)`)
          }
        }
      }
    }

    // Clean build hash if --all flag is set
    if (flags.all) {
      const buildHashPath = `${config.source}/.build_hash`
      if (existsSync(buildHashPath)) {
        try {
          rmSync(buildHashPath)
          cleanedCount++
          if (flags.verbose) {
            this.log(`   ✅ Removed ${buildHashPath}`)
          }
        } catch (error) {
          this.warn(`Failed to remove ${buildHashPath}: ${error}`)
        }
      }
    }

    if (cleanedCount > 0) {
      this.log(`✅ Cleaned ${cleanedCount} files/directories`)
    } else {
      this.log('ℹ️  Nothing to clean')
    }
  }
}
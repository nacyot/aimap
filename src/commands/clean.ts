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
    '<%= config.bin %> <%= command.id %> --hash',
  ]
  static flags = {
    all: Flags.boolean({
      default: false,
      description: 'Clean outputs for all agents (ignore config)',
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
    hash: Flags.boolean({
      default: false,
      description: 'Remove build hash file',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Verbose output',
    }),
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

    // Load config to get source directory and agents
    const configLoader = new ConfigLoader(flags.config)
    const config = configLoader.load()

    let cleanedCount = 0

    // Get agents to clean based on flags and config
    const agentsToClean = flags.all
      ? getAllAgents().map(a => a.id)  // --all flag: clean all agents
      : config.agents  // Use config agents (defaults to ['claude'] if not specified)

    if (flags.verbose) {
      this.log(`📋 Cleaning outputs for agents: ${agentsToClean.join(', ')}`)
    }

    // Clean files for specified agents
    for (const agentId of agentsToClean) {
      const agent = getAllAgents().find(a => a.id === agentId)
      if (!agent) {
        if (flags.verbose) {
          this.warn(`   ⚠️  Unknown agent: ${agentId}`)
        }

        continue
      }

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

    // Clean build hash if --hash flag is set
    if (flags.hash) {
      const buildHashPath = `${config.source}/.build_hash`
      if (existsSync(buildHashPath)) {
        try {
          rmSync(buildHashPath)
          cleanedCount++
          if (flags.verbose) {
            this.log(`   ✅ Removed build hash: ${buildHashPath}`)
          }
        } catch (error) {
          this.warn(`Failed to remove ${buildHashPath}: ${error}`)
        }
      } else if (flags.verbose) {
        this.log(`   ⏭️  No build hash file to remove`)
      }
    }

    if (cleanedCount > 0) {
      this.log(`✅ Cleaned ${cleanedCount} files/directories`)
    } else {
      this.log('ℹ️  Nothing to clean')
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
import {createHash} from 'node:crypto'
import {existsSync, readdirSync, readFileSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import * as yaml from 'yaml'

import type {BuildContext} from '../agents/types.js'

import {getAgent, getAgentIds} from '../agents/index.js'

export interface RulesBuilderOptions {
  agents?: string[]
  dryRun: boolean
  outputs?: {
    [key: string]: string
  }
  sourceDir: string
  verbose: boolean
}

export interface RuleFile {
  content: string
  name: string
  path: string
  title?: string
}

export class RulesBuilder {
  private agents: string[]
  private dryRun: boolean
  private outputs: RulesBuilderOptions['outputs']
  private ruleFiles: RuleFile[] = []
  private sourceDir: string
  private verbose: boolean

  constructor(options: RulesBuilderOptions) {
    this.sourceDir = options.sourceDir
    this.agents = options.agents || getAgentIds()
    this.verbose = options.verbose
    this.dryRun = options.dryRun
    this.outputs = options.outputs
  }

  async build(): Promise<void> {
    this.log('🔨 Building coding agent rules...')
    
    // 1. Check source directory
    if (!existsSync(this.sourceDir)) {
      throw new Error(`Source directory ${this.sourceDir} does not exist`)
    }

    // 2. Load rule files
    this.loadRuleFiles()
    
    if (this.ruleFiles.length === 0) {
      throw new Error(`No rule files found in ${this.sourceDir}`)
    }

    this.log(`📋 Found ${this.ruleFiles.length} rule files`)
    
    // 3. Update metadata
    this.updateMetadata()

    // 4. Build for each agent using registry
    const buildPromises = this.agents.map(agentId => this.buildForAgent(agentId))
    await Promise.all(buildPromises)

    // 5. Save build hash
    this.saveBuildHash()

    this.log(`\n🎉 Rules build completed!`)
    this.printSummary()
  }

  private async buildForAgent(agentId: string): Promise<void> {
    const agent = getAgent(agentId)
    
    if (!agent) {
      this.log(`⚠️  Unknown agent: ${agentId}`)
      return
    }

    this.log(`🤖 Building for ${agent.displayName}...`)
    
    // Clean before build to prevent orphaned files
    if (!this.dryRun && agent.clean) {
      try {
        agent.clean()
        if (this.verbose) {
          this.log(`   🧹 Cleaned existing ${agent.displayName} outputs`)
        }
      } catch {
        // Ignore clean errors (files might not exist)
        if (this.verbose) {
          this.log(`   ⏭️  No existing outputs to clean`)
        }
      }
    }
    
    // Create build context
    const context: BuildContext = {
      dryRun: this.dryRun,
      files: this.ruleFiles.map(f => f.name),
      sourceDir: this.sourceDir,
      verbose: this.verbose,
    }

    // If custom output path is specified, we need to handle it
    // For now, agents manage their own output paths
    // This could be extended to support custom outputs per agent
    
    try {
      await agent.builder(context)
      
      if (!this.dryRun) {
        for (const outputPath of agent.outputPaths) {
          this.log(`   ✅ ${outputPath} created`)
        }
      }
    } catch (error) {
      this.log(`   ❌ Failed to build for ${agent.displayName}: ${error}`)
    }
  }

  private generateHash(): string {
    const hash = createHash('sha256')
    
    for (const file of this.ruleFiles) {
      hash.update(file.content)
    }
    
    return hash.digest('hex')
  }

  private loadRuleFiles(): void {
    const files = readdirSync(this.sourceDir)
      .filter(file => file.endsWith('.md') || file.endsWith('.yaml'))
      .sort()

    for (const file of files) {
      const path = join(this.sourceDir, file)
      const content = readFileSync(path, 'utf8')
      
      let title: string | undefined
      if (file.endsWith('.md')) {
        // Extract first heading
        const match = content.match(/^#\s+(.+)$/m)
        title = match ? match[1] : undefined
      }

      this.ruleFiles.push({
        content,
        name: file,
        path,
        title,
      })

      if (this.verbose) {
        this.log(`   • ${file}${title ? ` - ${title}` : ''}`)
      }
    }
  }

  private log(message: string): void {
    console.log(message)
  }

  private printSummary(): void {
    console.log('\n📋 Build Summary:')
    console.log(`   • Source: ${this.sourceDir}`)
    console.log(`   • Files: ${this.ruleFiles.length}`)
    console.log(`   • Agents: ${this.agents.join(', ')}`)
    
    if (this.dryRun) {
      console.log('\n⚠️  This was a dry run. No files were actually created.')
    } else {
      console.log('\n📂 Generated outputs:')
      
      for (const agentId of this.agents) {
        const agent = getAgent(agentId)
        if (agent) {
          for (const outputPath of agent.outputPaths) {
            console.log(`   • ${outputPath} - ${agent.displayName}`)
          }
        }
      }
    }
  }

  private saveBuildHash(): void {
    const hash = this.generateHash()
    const hashFile = join(this.sourceDir, '.build_hash')
    
    if (!this.dryRun) {
      writeFileSync(hashFile, hash)
    }
    
    this.log(`🔒 Build hash saved: ${hash.slice(0, 16)}...`)
  }

  private updateMetadata(): void {
    const metaFile = join(this.sourceDir, '00-meta.yaml')
    if (!existsSync(metaFile)) {
      return
    }

    const content = readFileSync(metaFile, 'utf8')
    const meta = yaml.parse(content) as {
      [key: string]: unknown
      build_hash?: string
      build_timestamp?: string
    }
    
    // eslint-disable-next-line camelcase
    meta.build_timestamp = new Date().toISOString()
    // eslint-disable-next-line camelcase
    meta.build_hash = this.generateHash()

    if (!this.dryRun) {
      writeFileSync(metaFile, yaml.stringify(meta))
      this.log(`✅ Metadata updated (hash: ${meta.build_hash.slice(0, 8)}...)`)
    }
  }
}
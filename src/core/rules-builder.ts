import {existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync} from 'node:fs'
import {join, basename} from 'node:path'
import {createHash} from 'node:crypto'
import {execSync} from 'node:child_process'
import * as yaml from 'yaml'

export interface RulesBuilderOptions {
  sourceDir: string
  agents?: string[]
  verbose: boolean
  dryRun: boolean
}

export interface RuleFile {
  path: string
  name: string
  content: string
  title?: string
}

const SUPPORTED_AGENTS = ['claude', 'cline', 'roocode', 'cursor', 'windsurf', 'codex']

export class RulesBuilder {
  private sourceDir: string
  private agents: string[]
  private verbose: boolean
  private dryRun: boolean
  private ruleFiles: RuleFile[] = []

  constructor(options: RulesBuilderOptions) {
    this.sourceDir = options.sourceDir
    this.agents = options.agents || SUPPORTED_AGENTS
    this.verbose = options.verbose
    this.dryRun = options.dryRun
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

    // 4. Clean existing outputs
    if (!this.dryRun) {
      this.cleanExistingOutputs()
    }

    // 5. Build for each agent
    for (const agent of this.agents) {
      await this.buildForAgent(agent)
    }

    // 6. Save build hash
    this.saveBuildHash()

    this.log(`\n🎉 Rules build completed!`)
    this.printSummary()
  }

  private loadRuleFiles(): void {
    const files = readdirSync(this.sourceDir)
      .filter(file => file.endsWith('.md') || file.endsWith('.yaml'))
      .sort()

    for (const file of files) {
      const path = join(this.sourceDir, file)
      const content = readFileSync(path, 'utf-8')
      
      let title: string | undefined
      if (file.endsWith('.md')) {
        // Extract first heading
        const match = content.match(/^#\s+(.+)$/m)
        title = match ? match[1] : undefined
      }

      this.ruleFiles.push({
        path,
        name: file,
        content,
        title,
      })

      if (this.verbose) {
        this.log(`   • ${file}${title ? ` - ${title}` : ''}`)
      }
    }
  }

  private updateMetadata(): void {
    const metaFile = join(this.sourceDir, '00-meta.yaml')
    if (!existsSync(metaFile)) {
      return
    }

    const content = readFileSync(metaFile, 'utf-8')
    const meta = yaml.parse(content)
    
    meta.build_timestamp = new Date().toISOString()
    meta.build_hash = this.generateHash()

    if (!this.dryRun) {
      writeFileSync(metaFile, yaml.stringify(meta))
      this.log(`✅ Metadata updated (hash: ${meta.build_hash.substring(0, 8)}...)`)
    }
  }

  private generateHash(): string {
    const hash = createHash('sha256')
    
    for (const file of this.ruleFiles) {
      hash.update(file.content)
    }
    
    return hash.digest('hex')
  }

  private cleanExistingOutputs(): void {
    this.log('🧹 Cleaning existing outputs...')
    
    const cleanupPaths = [
      'CLAUDE.md',
      'AGENTS.md',
      '.clinerules',
      '.roo/rules',
      '.cursor/rules',
      '.windsurf/rules',
    ]

    for (const path of cleanupPaths) {
      if (existsSync(path)) {
        execSync(`rm -rf ${path}`)
        if (this.verbose) {
          this.log(`   ✅ Removed ${path}`)
        }
      }
    }
  }

  private async buildForAgent(agent: string): Promise<void> {
    switch (agent) {
      case 'claude':
        this.buildClaude()
        break
      case 'cline':
        this.buildCline()
        break
      case 'roocode':
        this.buildRooCode()
        break
      case 'cursor':
        this.buildCursor()
        break
      case 'windsurf':
        this.buildWindsurf()
        break
      case 'codex':
        this.buildCodex()
        break
      default:
        this.log(`⚠️  Unknown agent: ${agent}`)
    }
  }

  private buildClaude(): void {
    this.log('🤖 Building for Claude Code...')
    
    const content = [
      '# aimap Development Rules',
      '',
      'This file imports all development rules and guidelines for the project.',
      '',
      '## Build Information',
      `- Generated: ${new Date().toISOString()}`,
      '- Schema Version: 1.0',
      '',
      '## Rule Files',
      '',
      'The following rules are imported from the `.rules/` directory:',
      '',
    ]

    for (const file of this.ruleFiles.filter(f => f.name.endsWith('.md'))) {
      content.push(`- @${join(this.sourceDir, file.name)}${file.title ? ` - ${file.title}` : ''}`)
    }

    content.push('', '## Metadata', '', 'See @.rules/00-meta.yaml for build metadata.')

    if (!this.dryRun) {
      writeFileSync('CLAUDE.md', content.join('\n'))
    }
    
    this.log('   ✅ CLAUDE.md created')
  }

  private buildCline(): void {
    this.log('🤖 Building for Cline...')
    this.copyRulesToDir('.clinerules')
  }

  private buildRooCode(): void {
    this.log('🤖 Building for RooCode...')
    this.copyRulesToDir('.roo/rules')
  }

  private buildCursor(): void {
    this.log('🤖 Building for Cursor...')
    this.copyRulesToDir('.cursor/rules')
  }

  private buildWindsurf(): void {
    this.log('🤖 Building for Windsurf...')
    this.copyRulesToDir('.windsurf/rules')
  }

  private buildCodex(): void {
    this.log('🤖 Building for Codex (AGENTS.md)...')
    
    const content = [
      '---',
      'title: Project Coding & Process Rules',
      `version: "${new Date().toISOString().split('T')[0]}"`,
      'generator: aimap',
      '---',
      '',
      '# 📚 Project Development Rules',
      '',
      'This document contains all development rules and guidelines.',
      '',
      '## 📋 Index',
      '',
      '| ID | Title | File |',
      '|----|-------|------|',
    ]

    let id = 1
    for (const file of this.ruleFiles.filter(f => f.name.endsWith('.md'))) {
      content.push(`| R-${String(id).padStart(2, '0')} | ${file.title || file.name} | ${file.name} |`)
      id++
    }

    content.push('', '---', '')

    // Add all rule contents
    id = 1
    for (const file of this.ruleFiles.filter(f => f.name.endsWith('.md'))) {
      content.push(`# ${file.title || file.name} \`(R-${String(id).padStart(2, '0')})\``)
      content.push('')
      content.push(`> **Source:** ${file.name}`)
      content.push('')
      
      // Skip first line if it's a heading
      const lines = file.content.split('\n')
      const startIndex = lines[0].startsWith('#') ? 1 : 0
      content.push(...lines.slice(startIndex))
      
      content.push('', '---', '')
      id++
    }

    if (!this.dryRun) {
      writeFileSync('AGENTS.md', content.join('\n'))
    }
    
    this.log('   ✅ AGENTS.md created')
  }

  private copyRulesToDir(targetDir: string): void {
    if (!this.dryRun) {
      mkdirSync(targetDir, {recursive: true})
      
      for (const file of this.ruleFiles.filter(f => f.name.endsWith('.md'))) {
        const target = join(targetDir, file.name)
        copyFileSync(file.path, target)
      }
    }
    
    this.log(`   ✅ Rules copied to ${targetDir}`)
  }

  private saveBuildHash(): void {
    const hash = this.generateHash()
    const hashFile = join(this.sourceDir, '.build_hash')
    
    if (!this.dryRun) {
      writeFileSync(hashFile, hash)
    }
    
    this.log(`🔒 Build hash saved: ${hash.substring(0, 16)}...`)
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
      
      if (this.agents.includes('claude')) {
        console.log('   • CLAUDE.md - Claude Code (@ import syntax)')
      }
      if (this.agents.includes('cline')) {
        console.log('   • .clinerules/ - Cline')
      }
      if (this.agents.includes('roocode')) {
        console.log('   • .roo/rules/ - RooCode')
      }
      if (this.agents.includes('cursor')) {
        console.log('   • .cursor/rules/ - Cursor')
      }
      if (this.agents.includes('windsurf')) {
        console.log('   • .windsurf/rules/ - Windsurf')
      }
      if (this.agents.includes('codex')) {
        console.log('   • AGENTS.md - Codex')
      }
    }
  }

  private log(message: string): void {
    console.log(message)
  }
}
import {execSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import * as yaml from 'yaml'

export interface RulesBuilderOptions {
  agents?: string[]
  dryRun: boolean
  outputs?: {
    claude?: string
    cline?: string
    codex?: string
    cursor?: string
    roocode?: string
    windsurf?: string
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

const SUPPORTED_AGENTS = ['claude', 'cline', 'roocode', 'cursor', 'windsurf', 'codex']

export class RulesBuilder {
  private agents: string[]
  private dryRun: boolean
  private outputs: RulesBuilderOptions['outputs']
  private ruleFiles: RuleFile[] = []
  private sourceDir: string
  private verbose: boolean

  constructor(options: RulesBuilderOptions) {
    this.sourceDir = options.sourceDir
    this.agents = options.agents || SUPPORTED_AGENTS
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

    // 4. Clean existing outputs
    if (!this.dryRun) {
      this.cleanExistingOutputs()
    }

    // 5. Build for each agent
    for (const agent of this.agents) {
      this.buildForAgent(agent)
    }

    // 6. Save build hash
    this.saveBuildHash()

    this.log(`\n🎉 Rules build completed!`)
    this.printSummary()
  }

  private buildClaude(): void {
    this.log('🤖 Building for Claude Code...')
    const outputPath = this.outputs?.claude || 'CLAUDE.md'
    
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
      writeFileSync(outputPath, content.join('\n'))
    }
    
    this.log(`   ✅ ${outputPath} created`)
  }

  private buildCline(): void {
    this.log('🤖 Building for Cline...')
    this.copyRulesToDir(this.outputs?.cline || '.clinerules')
  }

  private buildCodex(): void {
    const outputPath = this.outputs?.codex || 'AGENTS.md'
    this.log(`🤖 Building for Codex (${outputPath})...`)
    
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
      content.push(`# ${file.title || file.name} \`(R-${String(id).padStart(2, '0')})\``, '', `> **Source:** ${file.name}`, '')
      
      // Skip first line if it's a heading
      const lines = file.content.split('\n')
      const startIndex = lines[0].startsWith('#') ? 1 : 0
      content.push(...lines.slice(startIndex), '', '---', '')
      id++
    }

    if (!this.dryRun) {
      writeFileSync(outputPath, content.join('\n'))
    }
    
    this.log(`   ✅ ${outputPath} created`)
  }

  private buildCursor(): void {
    this.log('🤖 Building for Cursor...')
    this.copyRulesToDir(this.outputs?.cursor || '.cursor/rules')
  }

  private buildForAgent(agent: string): void {
    switch (agent) {
      case 'claude': {
        this.buildClaude()
        break
      }

      case 'cline': {
        this.buildCline()
        break
      }

      case 'codex': {
        this.buildCodex()
        break
      }

      case 'cursor': {
        this.buildCursor()
        break
      }

      case 'roocode': {
        this.buildRooCode()
        break
      }

      case 'windsurf': {
        this.buildWindsurf()
        break
      }

      default: {
        this.log(`⚠️  Unknown agent: ${agent}`)
      }
    }
  }

  private buildRooCode(): void {
    this.log('🤖 Building for RooCode...')
    this.copyRulesToDir(this.outputs?.roocode || '.roo/rules')
  }

  private buildWindsurf(): void {
    this.log('🤖 Building for Windsurf...')
    this.copyRulesToDir(this.outputs?.windsurf || '.windsurf/rules')
  }

  private cleanExistingOutputs(): void {
    this.log('🧹 Cleaning existing outputs...')
    
    const cleanupPaths = [
      this.outputs?.claude || 'CLAUDE.md',
      this.outputs?.codex || 'AGENTS.md',
      this.outputs?.cline || '.clinerules',
      this.outputs?.roocode || '.roo/rules',
      this.outputs?.cursor || '.cursor/rules',
      this.outputs?.windsurf || '.windsurf/rules',
    ]

    for (const path of cleanupPaths) {
      if (existsSync(path)) {
        execSync(`rm -rf "${path}"`)
        if (this.verbose) {
          this.log(`   ✅ Removed ${path}`)
        }
      }
    }
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
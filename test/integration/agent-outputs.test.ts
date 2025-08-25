import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it} from 'vitest'
import * as yaml from 'yaml'

import {RulesBuilder} from '../../src/core/rules-builder.js'

describe('Agent Output Validation', () => {
  const testDir = './test-integration'
  const testRules = {
    '01-coding.md': '# Coding Standards\n\nUse TypeScript for all new code.',
    '02-testing.md': '# Testing\n\nWrite unit tests for all functions.',
    '03-security.md': '# Security\n\nNever expose sensitive data.',
  }
  
  beforeEach(() => {
    // Create test directory with sample rules
    mkdirSync(testDir, {recursive: true})
    for (const [file, content] of Object.entries(testRules)) {
      writeFileSync(join(testDir, file), content)
    }
  })
  
  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, {force: true, recursive: true})
    }
    
    // Clean up all generated files
    const filesToClean = [
      'AGENTS.md',
      'CLAUDE.md',
      'GEMINI.md',
      '.aider.conf.yml',
      '.amazonq',
      '.clinerules',
      '.cursor',
      '.cursorrules',
      '.github',
      '.roo',
      '.windsurfrules',
      '.aiassistant',
    ]
    
    for (const file of filesToClean) {
      if (existsSync(file)) {
        rmSync(file, {force: true, recursive: true})
      }
    }
  })
  
  describe('AGENTS.md (Universal)', () => {
    it('should combine all rules with separators', async () => {
      const builder = new RulesBuilder({
        agents: ['agents'],
        dryRun: false,
        sourceDir: testDir,
        verbose: false,
      })
      
      await builder.build()
      
      expect(existsSync('AGENTS.md')).toBe(true)
      const content = readFileSync('AGENTS.md', 'utf8')
      
      // Should contain all rules
      expect(content).toContain('# Coding Standards')
      expect(content).toContain('# Testing')
      expect(content).toContain('# Security')
      
      // Should have separators between rules
      expect(content).toContain('---')
      expect(content.match(/---/g)?.length).toBe(2) // 2 separators for 3 rules
    })
  })
  
  describe('CLAUDE.md (Claude Code)', () => {
    it('should create file with @ references', async () => {
      const builder = new RulesBuilder({
        agents: ['claude'],
        dryRun: false,
        sourceDir: testDir,
        verbose: false,
      })
      
      await builder.build()
      
      expect(existsSync('CLAUDE.md')).toBe(true)
      const content = readFileSync('CLAUDE.md', 'utf8')
      
      // Should contain @ references to source files
      expect(content).toContain('@test-integration/01-coding.md')
      expect(content).toContain('@test-integration/02-testing.md')
      expect(content).toContain('@test-integration/03-security.md')
      
      // Should NOT contain actual content
      expect(content).not.toContain('Use TypeScript')
    })
  })
  
  describe('.aider.conf.yml (Aider)', () => {
    it('should update read array with rule paths', async () => {
      // Create existing config
      const existingConfig = {
        'dark-mode': true,
        model: 'gpt-4',
      }
      writeFileSync('.aider.conf.yml', yaml.stringify(existingConfig))
      
      const builder = new RulesBuilder({
        agents: ['aider'],
        dryRun: false,
        sourceDir: testDir,
        verbose: false,
      })
      
      await builder.build()
      
      expect(existsSync('.aider.conf.yml')).toBe(true)
      const content = readFileSync('.aider.conf.yml', 'utf8')
      const config = yaml.parse(content)
      
      // Should preserve existing settings
      expect(config.model).toBe('gpt-4')
      expect(config['dark-mode']).toBe(true)
      
      // Should add read array with rule paths
      expect(config.read).toEqual([
        'test-integration/01-coding.md',
        'test-integration/02-testing.md',
        'test-integration/03-security.md',
      ])
    })
  })
  
  describe('.cursor/rules/ (Cursor IDE)', () => {
    it('should create .mdc files in directory', async () => {
      const builder = new RulesBuilder({
        agents: ['cursor'],
        dryRun: false,
        sourceDir: testDir,
        verbose: false,
      })
      
      await builder.build()
      
      // Check directory structure with .mdc files
      expect(existsSync('.cursor/rules')).toBe(true)
      expect(existsSync('.cursor/rules/01-coding.mdc')).toBe(true)
      expect(existsSync('.cursor/rules/02-testing.mdc')).toBe(true)
      expect(existsSync('.cursor/rules/03-security.mdc')).toBe(true)
      
      // Verify content is preserved
      const content = readFileSync('.cursor/rules/01-coding.mdc', 'utf8')
      expect(content).toBe(testRules['01-coding.md'])
      
      // Check legacy .cursorrules file
      expect(existsSync('.cursorrules')).toBe(true)
      const legacyContent = readFileSync('.cursorrules', 'utf8')
      expect(legacyContent).toContain('# Coding Standards')
      expect(legacyContent).toContain('# Testing')
      expect(legacyContent).toContain('# Security')
    })
  })
  
  describe('.github/instructions/ (GitHub Copilot)', () => {
    it('should create .instructions.md files with frontmatter', async () => {
      const builder = new RulesBuilder({
        agents: ['copilot'],
        dryRun: false,
        sourceDir: testDir,
        verbose: false,
      })
      
      await builder.build()
      
      expect(existsSync('.github/instructions')).toBe(true)
      expect(existsSync('.github/instructions/01-coding.instructions.md')).toBe(true)
      
      const content = readFileSync('.github/instructions/01-coding.instructions.md', 'utf8')
      
      // Should have frontmatter
      expect(content).toMatch(/^---\napplyTo: "\*\*"\n---\n/)
      
      // Should have original content
      expect(content).toContain('# Coding Standards')
      expect(content).toContain('Use TypeScript')
    })
  })
  
  describe('.amazonq/rules/ (Amazon Q)', () => {
    it('should copy files individually', async () => {
      const builder = new RulesBuilder({
        agents: ['amazonq'],
        dryRun: false,
        sourceDir: testDir,
        verbose: false,
      })
      
      await builder.build()
      
      expect(existsSync('.amazonq/rules')).toBe(true)
      
      for (const [file, content] of Object.entries(testRules)) {
        expect(existsSync(join('.amazonq/rules', file))).toBe(true)
        const actualContent = readFileSync(join('.amazonq/rules', file), 'utf8')
        expect(actualContent).toBe(content)
      }
    })
  })
  
  describe('.windsurfrules (Windsurf)', () => {
    it('should combine content into single file', async () => {
      const builder = new RulesBuilder({
        agents: ['windsurf'],
        dryRun: false,
        sourceDir: testDir,
        verbose: false,
      })
      
      await builder.build()
      
      expect(existsSync('.windsurfrules')).toBe(true)
      const content = readFileSync('.windsurfrules', 'utf8')
      
      // Should contain all rules combined
      expect(content).toContain('# Coding Standards')
      expect(content).toContain('# Testing')
      expect(content).toContain('# Security')
      
      // Check file size is under limit
      const size = Buffer.byteLength(content, 'utf8')
      expect(size).toBeLessThan(6000)
    })
  })
  
  describe('GEMINI.md (Gemini CLI)', () => {
    it('should create combined markdown file', async () => {
      const builder = new RulesBuilder({
        agents: ['gemini'],
        dryRun: false,
        sourceDir: testDir,
        verbose: false,
      })
      
      await builder.build()
      
      expect(existsSync('GEMINI.md')).toBe(true)
      const content = readFileSync('GEMINI.md', 'utf8')
      
      // Should contain all rules
      expect(content).toContain('# Coding Standards')
      expect(content).toContain('# Testing')
      expect(content).toContain('# Security')
    })
  })
  
  describe('Multi-agent build', () => {
    it('should generate correct outputs for all agents', async () => {
      const builder = new RulesBuilder({
        agents: ['claude', 'cursor', 'copilot', 'amazonq', 'windsurf'],
        dryRun: false,
        sourceDir: testDir,
        verbose: false,
      })
      
      await builder.build()
      
      // Verify each agent's output
      expect(existsSync('CLAUDE.md')).toBe(true)
      expect(existsSync('.cursor/rules/01-coding.mdc')).toBe(true)
      expect(existsSync('.cursorrules')).toBe(true)
      expect(existsSync('.github/instructions/01-coding.instructions.md')).toBe(true)
      expect(existsSync('.amazonq/rules/01-coding.md')).toBe(true)
      expect(existsSync('.windsurfrules')).toBe(true)
    })
  })
})
import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

import {clearRegistry, getAgent, getAllAgents, registerAllAgents} from '../../src/agents/index.js'

describe('Agent Implementations', () => {
  const testSourceDir = './test-rules'
  const testFiles = ['01-coding-style.md', '02-security.md', '03-testing.md']
  const testContent = {
    '01-coding-style.md': '# Coding Style\n\nUse consistent formatting.',
    '02-security.md': '# Security\n\nAlways validate inputs.',
    '03-testing.md': '# Testing\n\nWrite comprehensive tests.',
  }
  
  beforeEach(() => {
    // Create test source directory with sample rules
    mkdirSync(testSourceDir, {recursive: true})
    for (const [file, content] of Object.entries(testContent)) {
      writeFileSync(join(testSourceDir, file), content)
    }
    
    // Clear and re-register agents
    clearRegistry()
    registerAllAgents()
  })
  
  afterEach(() => {
    // Clean up test directory
    if (existsSync(testSourceDir)) {
      rmSync(testSourceDir, {force: true, recursive: true})
    }
    
    // Clean up all agent output files
    const filesToClean = [
      'CLAUDE.md',
      '.claude',
      '.cursor',
      '.cursorrules', 
      '.github/copilot-instructions.md',
      '.github',
      '.github/instructions',
      '.amazonq',
      '.gemini',
      '.aiassistant',
      '.tabnine',
      '.aider.conf.yml',
      '.aider-rules',
      'GEMINI.md',
      '.clinerules',
      '.roo',
      '.windsurfrules',
    ]
    
    for (const file of filesToClean) {
      if (existsSync(file)) {
        rmSync(file, {force: true, recursive: true})
      }
    }
  })
  
  describe('Claude Code', () => {
    it('should create CLAUDE.md with @ references', () => {
      const agent = getAgent('claude')
      expect(agent).toBeDefined()
      
      agent!.builder({
        dryRun: false,
        files: testFiles,
        sourceDir: testSourceDir,
        verbose: false,
      })
      
      expect(existsSync('CLAUDE.md')).toBe(true)
      const content = readFileSync('CLAUDE.md', 'utf8')
      expect(content).toContain('@test-rules/01-coding-style.md')
      expect(content).toContain('@test-rules/02-security.md')
      expect(content).toContain('@test-rules/03-testing.md')
    })
    
    // Removed test for .claude/settings.json as we no longer create it
  })
  
  describe('Cursor IDE', () => {
    it('should create .cursor/rules/ directory and .cursorrules', () => {
      const agent = getAgent('cursor')
      expect(agent).toBeDefined()
      
      agent!.builder({
        dryRun: false,
        files: testFiles,
        sourceDir: testSourceDir,
        verbose: false,
      })
      
      // Check .cursor/rules/ directory exists with individual .mdc files (2025 requirement)
      expect(existsSync('.cursor/rules')).toBe(true)
      for (const file of testFiles) {
        const mdcFile = file.replace(/\.md$/, '.mdc')
        expect(existsSync(join('.cursor/rules', mdcFile))).toBe(true)
        const content = readFileSync(join('.cursor/rules', mdcFile), 'utf8')
        expect(content).toBe(testContent[file])
      }
      
      // Check .cursorrules legacy file exists with combined content
      expect(existsSync('.cursorrules')).toBe(true)
      const legacyContent = readFileSync('.cursorrules', 'utf8')
      expect(legacyContent).toContain('# Coding Style')
      expect(legacyContent).toContain('# Security')
      expect(legacyContent).toContain('# Testing')
    })
  })
  
  describe('GitHub Copilot', () => {
    it('should create .github/instructions/*.instructions.md files', () => {
      const agent = getAgent('copilot')
      expect(agent).toBeDefined()
      
      agent!.builder({
        dryRun: false,
        files: testFiles,
        sourceDir: testSourceDir,
        verbose: false,
      })
      
      expect(existsSync('.github/instructions/01-coding-style.instructions.md')).toBe(true)
      expect(existsSync('.github/instructions/02-security.instructions.md')).toBe(true)
      expect(existsSync('.github/instructions/03-testing.instructions.md')).toBe(true)
      
      const content = readFileSync('.github/instructions/01-coding-style.instructions.md', 'utf8')
      expect(content).toContain('---')
      expect(content).toContain('applyTo: "**"')
      expect(content).toContain('# Coding Style')
    })
    
    // Removed test for 8KB warning as we always use granular instructions now
  })
  
  describe('Amazon Q Developer', () => {
    it('should create .amazonq/rules/ with individual files', () => {
      const agent = getAgent('amazonq')
      expect(agent).toBeDefined()
      
      agent!.builder({
        dryRun: false,
        files: testFiles,
        sourceDir: testSourceDir,
        verbose: false,
      })
      
      for (const file of testFiles) {
        expect(existsSync(join('.amazonq/rules', file))).toBe(true)
        const content = readFileSync(join('.amazonq/rules', file), 'utf8')
        expect(content).toBe(testContent[file])
      }
    })
    
    it('should warn if file exceeds 32KB', () => {
      const agent = getAgent('amazonq')
      const largeFile = '04-large.md'
      const largeContent = 'x'.repeat(33_000)
      writeFileSync(join(testSourceDir, largeFile), largeContent)
      
      const consoleSpy = vi.spyOn(console, 'warn')
      
      agent!.builder({
        dryRun: false,
        files: [largeFile],
        sourceDir: testSourceDir,
        verbose: false,
      })
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('exceeds 32768 byte limit'))
      consoleSpy.mockRestore()
    })
    
    it('should warn when approaching 32KB limit', () => {
      const agent = getAgent('amazonq')
      const largeFile = '05-approaching.md'
      const largeContent = 'x'.repeat(29_000) // >28KB warning threshold
      writeFileSync(join(testSourceDir, largeFile), largeContent)
      
      const consoleSpy = vi.spyOn(console, 'warn')
      
      agent!.builder({
        dryRun: false,
        files: [largeFile],
        sourceDir: testSourceDir,
        verbose: false,
      })
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('approaching 32768 byte limit'))
      consoleSpy.mockRestore()
    })
  })
  
  describe('Google Gemini', () => {
    it('should create GEMINI.md', () => {
      const agent = getAgent('gemini')
      expect(agent).toBeDefined()
      
      agent!.builder({
        dryRun: false,
        files: testFiles,
        sourceDir: testSourceDir,
        verbose: false,
      })
      
      expect(existsSync('GEMINI.md')).toBe(true)
      const content = readFileSync('GEMINI.md', 'utf8')
      expect(content).toContain('# Coding Style')
      expect(content).toContain('# Security')
      expect(content).toContain('# Testing')
    })
  })
  
  describe('JetBrains AI Assistant', () => {
    it('should create .aiassistant/rules/ with individual files', () => {
      const agent = getAgent('jetbrains')
      expect(agent).toBeDefined()
      
      agent!.builder({
        dryRun: false,
        files: testFiles,
        sourceDir: testSourceDir,
        verbose: false,
      })
      
      for (const file of testFiles) {
        expect(existsSync(join('.aiassistant/rules', file))).toBe(true)
        const content = readFileSync(join('.aiassistant/rules', file), 'utf8')
        expect(content).toBe(testContent[file])
      }
    })
  })
  
  // Tabnine support has been removed
  
  describe('Aider', () => {
    it('should update .aider.conf.yml with read array', () => {
      const agent = getAgent('aider')
      expect(agent).toBeDefined()
      
      agent!.builder({
        dryRun: false,
        files: testFiles,
        sourceDir: testSourceDir,
        verbose: false,
      })
      
      expect(existsSync('.aider.conf.yml')).toBe(true)
      const content = readFileSync('.aider.conf.yml', 'utf8')
      expect(content).toContain('read:')
      expect(content).toContain('.rules/01-coding-style.md')
      expect(content).toContain('.rules/02-security.md')
      expect(content).toContain('.rules/03-testing.md')
    })
  })
  
  describe('Cline', () => {
    it('should create .clinerules/ with individual files', () => {
      const agent = getAgent('cline')
      expect(agent).toBeDefined()
      
      agent!.builder({
        dryRun: false,
        files: testFiles,
        sourceDir: testSourceDir,
        verbose: false,
      })
      
      for (const file of testFiles) {
        expect(existsSync(join('.clinerules', file))).toBe(true)
        const content = readFileSync(join('.clinerules', file), 'utf8')
        expect(content).toBe(testContent[file])
      }
    })
  })
  
  describe('RooCode', () => {
    it('should create .roo/rules/ with individual files', () => {
      const agent = getAgent('roocode')
      expect(agent).toBeDefined()
      
      agent!.builder({
        dryRun: false,
        files: testFiles,
        sourceDir: testSourceDir,
        verbose: false,
      })
      
      for (const file of testFiles) {
        expect(existsSync(join('.roo/rules', file))).toBe(true)
        const content = readFileSync(join('.roo/rules', file), 'utf8')
        expect(content).toBe(testContent[file])
      }
    })
  })
  
  describe('Windsurf/Codeium', () => {
    it('should create .windsurfrules', () => {
      const agent = getAgent('windsurf')
      expect(agent).toBeDefined()
      
      agent!.builder({
        dryRun: false,
        files: testFiles,
        sourceDir: testSourceDir,
        verbose: false,
      })
      
      expect(existsSync('.windsurfrules')).toBe(true)
      const content = readFileSync('.windsurfrules', 'utf8')
      expect(content).toContain('# Coding Style')
      expect(content).toContain('# Security')
      expect(content).toContain('# Testing')
    })
    
    it('should warn if content exceeds 6KB hard limit', () => {
      const agent = getAgent('windsurf')
      const largeFile = '04-large.md'
      const largeContent = 'x'.repeat(7000)
      writeFileSync(join(testSourceDir, largeFile), largeContent)
      
      const consoleSpy = vi.spyOn(console, 'warn')
      
      agent!.builder({
        dryRun: false,
        files: [largeFile],
        sourceDir: testSourceDir,
        verbose: false,
      })
      
      // Should warn about exceeding limit
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('exceeding Windsurf\'s 6000 byte limit'))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Windsurf will ignore the entire file'))
      
      // File should still be created even when size exceeds limit
      expect(existsSync('.windsurfrules')).toBe(true)
      
      consoleSpy.mockRestore()
    })
    
    it('should warn when approaching 6KB limit', () => {
      const agent = getAgent('windsurf')
      const largeFile = '04-large.md'
      const largeContent = 'x'.repeat(5500) // 90% of limit
      writeFileSync(join(testSourceDir, largeFile), largeContent)
      
      const consoleSpy = vi.spyOn(console, 'warn')
      
      agent!.builder({
        dryRun: false,
        files: [largeFile],
        sourceDir: testSourceDir,
        verbose: false,
      })
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('90% of 6000 byte limit'))
      consoleSpy.mockRestore()
    })
  })
  
  describe('Agent Registry', () => {
    it('should register all core agents', () => {
      const agents = getAllAgents()
      const agentIds = agents.map(a => a.id).sort()
      
      expect(agentIds).toEqual([
        'agents',
        'aider',
        'amazonq',
        'claude',
        'cline',
        'copilot',
        'cursor',
        'gemini',
        'jetbrains',
        'roocode',
        'windsurf',
      ])
    })
    
    it('should have correct display names', () => {
      expect(getAgent('agents')?.displayName).toBe('Universal Agents')
      expect(getAgent('claude')?.displayName).toBe('Claude Code')
      expect(getAgent('cursor')?.displayName).toBe('Cursor IDE')
      expect(getAgent('copilot')?.displayName).toBe('GitHub Copilot')
      expect(getAgent('amazonq')?.displayName).toBe('Amazon Q Developer')
      expect(getAgent('gemini')?.displayName).toBe('Gemini CLI')
      expect(getAgent('jetbrains')?.displayName).toBe('JetBrains AI Assistant')
      expect(getAgent('windsurf')?.displayName).toBe('Windsurf/Codeium')
    })
  })
})
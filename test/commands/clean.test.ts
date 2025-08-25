import {existsSync, mkdirSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

import {clearRegistry, registerAllAgents} from '../../src/agents/index.js'
import Clean from '../../src/commands/clean.js'

describe('Clean Command', () => {
  const testDir = './test-clean-project'
  const rulesDir = join(testDir, '.rules')
  const originalCwd = process.cwd()
  
  beforeEach(() => {
    // Create test directory structure
    mkdirSync(testDir, {recursive: true})
    mkdirSync(rulesDir, {recursive: true})
    
    // Create config file
    const config = `
source: .rules
agents:
  - claude
  - cursor
`
    writeFileSync(join(testDir, '.aimap.yml'), config)
    
    // Create git directory (required for project root detection)
    mkdirSync(join(testDir, '.git'), {recursive: true})
    
    // Create some test files to clean
    writeFileSync(join(testDir, 'CLAUDE.md'), '# Claude rules')
    mkdirSync(join(testDir, '.cursor/rules'), {recursive: true})
    writeFileSync(join(testDir, '.cursorrules'), '# Cursor rules')
    writeFileSync(join(testDir, '.windsurfrules'), '# Windsurf rules')
    writeFileSync(join(testDir, 'AGENTS.md'), '# All rules')
    mkdirSync(join(testDir, '.clinerules'), {recursive: true})
    writeFileSync(join(testDir, '.clinerules/test.md'), '# Cline rule')
    writeFileSync(join(rulesDir, '.build_hash'), 'test-hash-123')
    
    // Change to test directory
    process.chdir(testDir)
    
    // Register agents
    clearRegistry()
    registerAllAgents()
  })
  
  afterEach(() => {
    // Change back to original directory
    process.chdir(originalCwd)
    
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, {force: true, recursive: true})
    }
  })
  
  describe('default behavior', () => {
    it('should clean only configured agents', async () => {
      await Clean.run([])
      
      // Configured agents should be cleaned
      expect(existsSync('CLAUDE.md')).toBe(false)
      expect(existsSync('.cursor')).toBe(false)
      expect(existsSync('.cursorrules')).toBe(false)
      
      // Non-configured agents should remain
      expect(existsSync('.windsurfrules')).toBe(true)
      expect(existsSync('AGENTS.md')).toBe(true)
      expect(existsSync('.clinerules')).toBe(true)
      
      // Build hash should remain
      expect(existsSync('.rules/.build_hash')).toBe(true)
    })
    
    it('should use default agent when config is missing', async () => {
      // Remove config file
      rmSync('.aimap.yml')
      
      await Clean.run([])
      
      // Should clean default agent (claude)
      expect(existsSync('CLAUDE.md')).toBe(false)
      
      // Others should remain
      expect(existsSync('.cursor')).toBe(true)
      expect(existsSync('.windsurfrules')).toBe(true)
    })
  })
  
  describe('--all flag', () => {
    it('should clean all agents regardless of config', async () => {
      await Clean.run(['--all'])
      
      // All agents should be cleaned
      expect(existsSync('CLAUDE.md')).toBe(false)
      expect(existsSync('.cursor')).toBe(false)
      expect(existsSync('.cursorrules')).toBe(false)
      expect(existsSync('.windsurfrules')).toBe(false)
      expect(existsSync('AGENTS.md')).toBe(false)
      expect(existsSync('.clinerules')).toBe(false)
      
      // Build hash should remain without --hash flag
      expect(existsSync('.rules/.build_hash')).toBe(true)
    })
  })
  
  describe('--hash flag', () => {
    it('should remove build hash file', async () => {
      await Clean.run(['--hash'])
      
      // Configured agents should be cleaned
      expect(existsSync('CLAUDE.md')).toBe(false)
      expect(existsSync('.cursor')).toBe(false)
      
      // Build hash should be removed
      expect(existsSync('.rules/.build_hash')).toBe(false)
      
      // Non-configured agents should remain
      expect(existsSync('.windsurfrules')).toBe(true)
    })
    
    it('should handle missing build hash gracefully', async () => {
      // Remove build hash first
      rmSync('.rules/.build_hash')
      
      // Should not throw error
      await expect(Clean.run(['--hash', '--verbose'])).resolves.not.toThrow()
    })
  })
  
  describe('--all --hash flags combined', () => {
    it('should clean everything', async () => {
      await Clean.run(['--all', '--hash'])
      
      // All agents should be cleaned
      expect(existsSync('CLAUDE.md')).toBe(false)
      expect(existsSync('.cursor')).toBe(false)
      expect(existsSync('.cursorrules')).toBe(false)
      expect(existsSync('.windsurfrules')).toBe(false)
      expect(existsSync('AGENTS.md')).toBe(false)
      expect(existsSync('.clinerules')).toBe(false)
      
      // Build hash should also be removed
      expect(existsSync('.rules/.build_hash')).toBe(false)
    })
  })
  
  describe('--verbose flag', () => {
    it('should show detailed output', async () => {
      const logSpy = vi.spyOn(console, 'log')
      
      await Clean.run(['--verbose'])
      
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('📋 Cleaning outputs for agents:'))
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('claude, cursor'))
      
      logSpy.mockRestore()
    })
    
    it('should show all agents with --all --verbose', async () => {
      const logSpy = vi.spyOn(console, 'log')
      
      await Clean.run(['--all', '--verbose'])
      
      const output = logSpy.mock.calls.map(call => call[0]).join('\n')
      expect(output).toContain('📋 Cleaning outputs for agents:')
      expect(output).toContain('agents')
      expect(output).toContain('claude')
      expect(output).toContain('cursor')
      expect(output).toContain('windsurf')
      
      logSpy.mockRestore()
    })
  })
  
  describe('error handling', () => {
    it.skip('should require git repository', async () => {
      // Remove .git directory
      rmSync('.git', {force: true, recursive: true})
      
      // Also need to prevent finding parent .git
      // Use --force to bypass project root check first
      await expect(Clean.run(['--force'])).rejects.toThrow('Not in a git repository')
    })
    
    it('should allow --force to bypass project root check', async () => {
      // Create a subdirectory and change to it
      const subDir = 'subdir'
      mkdirSync(subDir)
      process.chdir(subDir)
      
      // Should fail without --force
      await expect(Clean.run([])).rejects.toThrow('Not in project root')
      
      // Should work with --force
      process.chdir('..')
      await expect(Clean.run(['--force'])).resolves.not.toThrow()
    })
    
    it.skip('should handle unknown agents in config gracefully', async () => {
      // Create config with unknown agent
      const badConfig = `
source: .rules
agents:
  - claude
  - unknown-agent
  - cursor
`
      writeFileSync('.aimap.yml', badConfig)
      
      // Capture output using the oclif test method
      const output: string[] = []
      const originalWarn = console.warn
      console.warn = (msg: string) => output.push(msg)
      
      try {
        await Clean.run(['--verbose'])
        
        // Should warn about unknown agent
        expect(output.some(msg => msg.includes('Unknown agent: unknown-agent'))).toBe(true)
        
        // Should still clean known agents
        expect(existsSync('CLAUDE.md')).toBe(false)
        expect(existsSync('.cursor')).toBe(false)
      } finally {
        console.warn = originalWarn
      }
    })
  })
})
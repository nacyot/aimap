import {existsSync, mkdirSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it} from 'vitest'

import Build from '../../src/commands/build.js'

describe('Build Command', () => {
  const testDir = './test-rules'
  const testConfig = '.test-aimap.yml'
  
  beforeEach(() => {
    // Create test directory and files
    mkdirSync(testDir, {recursive: true})
    writeFileSync(join(testDir, '01-test.md'), '# Test Rule\n\nThis is a test rule.')
    writeFileSync(join(testDir, '00-meta.yaml'), 'version: 1.0\n')
    
    // Create git directory (required for project root detection)
    if (!existsSync('.git')) {
      mkdirSync('.git', {recursive: true})
    }
  })
  
  afterEach(() => {
    // Clean up test files
    if (existsSync(testDir)) {
      rmSync(testDir, {force: true, recursive: true})
    }

    if (existsSync(testConfig)) {
      rmSync(testConfig)
    }

    // Clean generated files
    const filesToClean = [
      'CLAUDE.md', 'AGENTS.md', '.clinerules', '.roo', '.cursor', 
      '.cursorrules', '.windsurf', '.windsurfrules', '.aider.conf.yml',
      '.amazonq', '.github', 'GEMINI.md', '.aiassistant'
    ]
    for (const file of filesToClean) {
      if (existsSync(file)) {
        rmSync(file, {force: true, recursive: true})
      }
    }
  })
  
  // Removed dangerous test that creates .rules in project root
  // Use custom source directory tests instead
  
  it('should build rules from custom source', async () => {
    // Clean up any existing CLAUDE.md first
    if (existsSync('CLAUDE.md')) {
      rmSync('CLAUDE.md')
    }
    
    await Build.run(['--source', testDir, '--agents', 'claude', '--force'])
    expect(existsSync('CLAUDE.md')).toBe(true)
  })
  
  // eslint-disable-next-line mocha/no-skipped-tests
  it.skip('should support dry run mode', async () => {
    // Clean up any existing files first
    if (existsSync('CLAUDE.md')) {
      rmSync('CLAUDE.md')
    }
    
    await Build.run(['--source', testDir, '--agents', 'claude', '--dry'])
    expect(existsSync('CLAUDE.md')).toBe(false)
  })
  
  it('should build for multiple agents', async () => {
    // Clean up any existing files first
    if (existsSync('CLAUDE.md')) {
      rmSync('CLAUDE.md')
    }
    
    if (existsSync('.cursor')) {
      rmSync('.cursor', {force: true, recursive: true})
    }
    
    await Build.run(['--source', testDir, '--agents', 'claude,cursor', '--force'])
    expect(existsSync('CLAUDE.md')).toBe(true)
    
    expect(existsSync('.cursor/rules')).toBe(true) // Directory should exist
    expect(existsSync('.cursor/rules/01-test.mdc')).toBe(true) // .mdc extension for 2025
  })
  
  it('should load config from .aimap.yml', async () => {
    // Create test config
    writeFileSync(testConfig, `
source: ${testDir}
agents:
  - claude
`)
    
    await Build.run(['--config', testConfig, '--force'])
    expect(existsSync('CLAUDE.md')).toBe(true)
  })
  
  describe('clean-before-build behavior', () => {
    it('should clean orphaned files when building', async () => {
      // Ensure test directory exists for this test
      if (!existsSync(testDir)) {
        mkdirSync(testDir, {recursive: true})
        writeFileSync(join(testDir, '01-test.md'), '# Test Rule\n\nThis is a test rule.')
      }
      
      // Create .cursor/rules directory with orphaned file
      mkdirSync('.cursor/rules', {recursive: true})
      writeFileSync('.cursor/rules/99-orphaned.mdc', '# This should be removed')
      writeFileSync('.cursor/rules/01-test.mdc', '# This will be replaced')
      
      // Build with cursor agent
      await Build.run(['--source', testDir, '--agents', 'cursor', '--force'])
      
      // Orphaned file should be removed
      expect(existsSync('.cursor/rules/99-orphaned.mdc')).toBe(false)
      
      // New file should exist
      expect(existsSync('.cursor/rules/01-test.mdc')).toBe(true)
      
      // Check file count - should only have the one rule file
      const fs = await import('node:fs')
      const files = fs.readdirSync('.cursor/rules')
      expect(files.length).toBe(1)
      expect(files[0]).toBe('01-test.mdc')
    })
    
    it('should handle clean errors gracefully in dry-run mode', async () => {
      // Dry run should not attempt to clean
      await Build.run(['--source', testDir, '--agents', 'cursor', '--dry', '--force'])
      
      // Nothing should be created in dry-run mode
      expect(existsSync('.cursor')).toBe(false)
    })
  })
})

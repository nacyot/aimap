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
    const filesToClean = ['CLAUDE.md', 'AGENTS.md', '.clinerules', '.roo', '.cursor', '.windsurf']
    for (const file of filesToClean) {
      if (existsSync(file)) {
        rmSync(file, {force: true, recursive: true})
      }
    }
  })
  
  it.skip('should build rules from default source', async () => {
    // Create temporary .rules directory
    mkdirSync('.rules', {recursive: true})
    writeFileSync('.rules/01-test.md', '# Test Rule\n\nContent')
    
    // Clean up any existing CLAUDE.md from previous tests
    if (existsSync('CLAUDE.md')) {
      rmSync('CLAUDE.md')
    }
    
    try {
      await Build.run(['--agents', 'claude'])
      expect(existsSync('CLAUDE.md')).toBe(true)
    } finally {
      // Clean up .rules and generated files
      if (existsSync('.rules')) {
        rmSync('.rules', {force: true, recursive: true})
      }

      if (existsSync('CLAUDE.md')) {
        rmSync('CLAUDE.md')
      }
    }
  })
  
  it('should build rules from custom source', async () => {
    // Clean up any existing CLAUDE.md first
    if (existsSync('CLAUDE.md')) {
      rmSync('CLAUDE.md')
    }
    
    await Build.run(['--source', testDir, '--agents', 'claude', '--force'])
    expect(existsSync('CLAUDE.md')).toBe(true)
  })
  
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
})
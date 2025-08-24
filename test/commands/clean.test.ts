import {existsSync, mkdirSync, rmSync, writeFileSync} from 'node:fs'
import {afterEach, beforeEach, describe, expect, it} from 'vitest'

import Clean from '../../src/commands/clean.js'

describe('Clean Command', () => {
  beforeEach(() => {
    // Create test files to clean
    writeFileSync('CLAUDE.md', 'test')
    writeFileSync('AGENTS.md', 'test')
    mkdirSync('.clinerules', {recursive: true})
    writeFileSync('.clinerules/test.md', 'test')
  })
  
  afterEach(() => {
    // Clean up any remaining files
    const files = ['CLAUDE.md', 'AGENTS.md', '.clinerules', '.roo', '.cursor', '.windsurf']
    for (const file of files) {
      if (existsSync(file)) {
        rmSync(file, {force: true, recursive: true})
      }
    }
  })
  
  it('should clean generated files', async () => {
    expect(existsSync('CLAUDE.md')).toBe(true)
    expect(existsSync('AGENTS.md')).toBe(true)
    expect(existsSync('.clinerules')).toBe(true)
    
    await Clean.run([])
    
    expect(existsSync('CLAUDE.md')).toBe(false)
    expect(existsSync('AGENTS.md')).toBe(false)
    expect(existsSync('.clinerules')).toBe(false)
  })
  
  it('should handle non-existent files gracefully', async () => {
    // Remove some files first
    rmSync('AGENTS.md')
    
    // Should not throw error
    await Clean.run([])
    
    expect(existsSync('CLAUDE.md')).toBe(false)
  })
  
  it('should support verbose mode', async () => {
    const output: string[] = []
    const originalLog = console.log
    console.log = (msg: string) => output.push(msg)
    
    try {
      await Clean.run(['--verbose'])
      expect(output.some(msg => msg.includes('Removed'))).toBe(true)
    } finally {
      console.log = originalLog
    }
  })
})
import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it} from 'vitest'

import {RulesBuilder} from '../../src/core/rules-builder.js'

describe('RulesBuilder', () => {
  const testDir = './test-rules-builder'
  
  beforeEach(() => {
    // Create test directory with rules
    mkdirSync(testDir, {recursive: true})
    writeFileSync(join(testDir, '01-general.md'), '# General Rules\n\nTest content')
    writeFileSync(join(testDir, '02-specific.md'), '# Specific Rules\n\nMore content')
    writeFileSync(join(testDir, '00-meta.yaml'), 'version: 1.0\n')
  })
  
  afterEach(() => {
    // Clean up
    if (existsSync(testDir)) {
      rmSync(testDir, {force: true, recursive: true})
    }
    
    const filesToClean = ['CLAUDE.md', 'AGENTS.md', '.clinerules', '.roo', '.cursor', '.windsurf', '.cursorrules', '.windsurfrules']
    for (const file of filesToClean) {
      if (existsSync(file)) {
        rmSync(file, {force: true, recursive: true})
      }
    }
  })
  
  it('should build rules for Claude', async () => {
    // Clean up any existing CLAUDE.md first
    if (existsSync('CLAUDE.md')) {
      rmSync('CLAUDE.md')
    }
    
    const builder = new RulesBuilder({
      agents: ['claude'],
      dryRun: false,
      sourceDir: testDir,
      verbose: false,
    })
    
    await builder.build()
    
    expect(existsSync('CLAUDE.md')).toBe(true)
    const content = readFileSync('CLAUDE.md', 'utf8')
    // The relative path includes the ./ prefix
    expect(content).toContain('test-rules-builder/01-general.md')
    expect(content).toContain('test-rules-builder/02-specific.md')
    // Should be bullet list style
    expect(content).toMatch(/^-\s@/m)
  })

  it('should use CLAUDE.tempalte.md when present', async () => {
    // Arrange: create a template with placeholder
    const template = `# Claude Rules\n\nBelow are the rules:\n\n@@RULES@@\n\n-- end --\n`
    writeFileSync('CLAUDE.tempalte.md', template)

    const builder = new RulesBuilder({
      agents: ['claude'],
      dryRun: false,
      sourceDir: testDir,
      verbose: false,
    })

    // Act
    await builder.build()

    // Assert
    expect(existsSync('CLAUDE.md')).toBe(true)
    const content = readFileSync('CLAUDE.md', 'utf8')
    expect(content.startsWith('# Claude Rules')).toBe(true)
    expect(content).toContain('- @test-rules-builder/01-general.md')
    expect(content).toContain('-- end --')

    // Cleanup template
    rmSync('CLAUDE.tempalte.md')
  })
  
  it('should build rules for Cline', async () => {
    const builder = new RulesBuilder({
      agents: ['cline'],
      dryRun: false,
      sourceDir: testDir,
      verbose: false,
    })
    
    await builder.build()
    
    expect(existsSync('.clinerules')).toBe(true)
    expect(existsSync('.clinerules/01-general.md')).toBe(true)
    expect(existsSync('.clinerules/02-specific.md')).toBe(true)
  })
  
  it('should support dry run mode', async () => {
    // Clean up any existing files first
    if (existsSync('CLAUDE.md')) {
      rmSync('CLAUDE.md')
    }

    
    const builder = new RulesBuilder({
      agents: ['claude'],
      dryRun: true,
      sourceDir: testDir,
      verbose: false,
    })
    
    await builder.build()
    
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
    
    if (existsSync('.cursorrules')) {
      rmSync('.cursorrules')
    }
    
    const builder = new RulesBuilder({
      agents: ['claude', 'cursor'],
      dryRun: false,
      sourceDir: testDir,
      verbose: false,
    })
    
    await builder.build()
    
    expect(existsSync('CLAUDE.md')).toBe(true)
    expect(existsSync('.cursor/rules')).toBe(true) // Directory should exist
    expect(existsSync('.cursor/rules/01-general.mdc')).toBe(true) // .mdc extension for 2025
    expect(existsSync('.cursor/rules/02-specific.mdc')).toBe(true)
    expect(existsSync('.cursorrules')).toBe(true) // Legacy file for backward compatibility
  })
  
  it('should generate build hash', async () => {
    const builder = new RulesBuilder({
      agents: ['claude'],
      dryRun: false,
      sourceDir: testDir,
      verbose: false,
    })
    
    await builder.build()
    
    expect(existsSync(join(testDir, '.build_hash'))).toBe(true)
  })
  
  it('should throw error if source directory does not exist', async () => {
    const builder = new RulesBuilder({
      agents: ['claude'],
      dryRun: false,
      sourceDir: 'non-existent-dir',
      verbose: false,
    })
    
    await expect(builder.build()).rejects.toThrow('does not exist')
  })
  
  it.skip('should support custom output paths', async () => {
    // Implement custom output paths in the new registry system
    const builder = new RulesBuilder({
      agents: ['claude'],
      dryRun: false,
      outputs: {
        claude: 'CUSTOM.md',
      },
      sourceDir: testDir,
      verbose: false,
    })
    
    await builder.build()
    
    expect(existsSync('CUSTOM.md')).toBe(true)
    expect(existsSync('CLAUDE.md')).toBe(false)
  })
})

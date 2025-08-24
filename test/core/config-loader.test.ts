import {existsSync, rmSync, writeFileSync} from 'node:fs'
import {afterEach, describe, expect, it} from 'vitest'

import {ConfigLoader} from '../../src/core/config-loader.js'

describe('ConfigLoader', () => {
  const testConfigPath = '.test-aimap.yml'
  
  afterEach(() => {
    if (existsSync(testConfigPath)) {
      rmSync(testConfigPath)
    }
  })
  
  it('should return default config when file does not exist', () => {
    const loader = new ConfigLoader('non-existent.yml')
    const config = loader.load()
    
    expect(config.source).toBe('.rules')
    expect(config.agents).toEqual(['claude', 'cline', 'roocode', 'cursor', 'windsurf', 'codex'])
    expect(config.outputs).toBeUndefined()
  })
  
  it('should load config from YAML file', () => {
    writeFileSync(testConfigPath, `
source: custom/rules
agents:
  - claude
  - cursor
outputs:
  claude: CUSTOM_CLAUDE.md
`)
    
    const loader = new ConfigLoader(testConfigPath)
    const config = loader.load()
    
    expect(config.source).toBe('custom/rules')
    expect(config.agents).toEqual(['claude', 'cursor'])
    expect(config.outputs?.claude).toBe('CUSTOM_CLAUDE.md')
  })
  
  it('should merge with defaults for missing fields', () => {
    writeFileSync(testConfigPath, `
agents:
  - claude
`)
    
    const loader = new ConfigLoader(testConfigPath)
    const config = loader.load()
    
    expect(config.source).toBe('.rules') // default
    expect(config.agents).toEqual(['claude'])
  })
  
  it('should handle invalid YAML gracefully', () => {
    writeFileSync(testConfigPath, `
invalid yaml {
  this is not valid
`)
    
    const loader = new ConfigLoader(testConfigPath)
    const config = loader.load()
    
    // Should return defaults
    expect(config.source).toBe('.rules')
    expect(config.agents).toEqual(['claude', 'cline', 'roocode', 'cursor', 'windsurf', 'codex'])
  })
  
  it('should detect if config file exists', () => {
    const loader1 = new ConfigLoader('non-existent.yml')
    expect(loader1.exists()).toBe(false)
    
    writeFileSync(testConfigPath, 'source: .rules')
    const loader2 = new ConfigLoader(testConfigPath)
    expect(loader2.exists()).toBe(true)
  })
})
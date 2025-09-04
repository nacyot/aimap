import {existsSync, mkdirSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

import Check from '../../src/commands/check.js'
import Hash from '../../src/commands/hash.js'
import {computeRulesHash} from '../../src/core/rules-hash.js'

describe('Hash and Check Commands', () => {
  const testDir = './test-hash-status'
  const rulesDir = join(testDir, '.rules')
  const originalCwd = process.cwd()

  beforeEach(() => {
    mkdirSync(testDir, {recursive: true})
    mkdirSync(rulesDir, {recursive: true})

    // Minimal rules
    writeFileSync(join(rulesDir, '01-a.md'), '# A')
    writeFileSync(join(rulesDir, '02-b.md'), '# B')

    // Config + git
    writeFileSync(join(testDir, '.aimap.yml'), 'source: .rules\nagents:\n  - claude\n')
    mkdirSync(join(testDir, '.git'), {recursive: true})

    process.chdir(testDir)
  })

  afterEach(() => {
    process.chdir(originalCwd)
    if (existsSync(testDir)) rmSync(testDir, {force: true, recursive: true})
  })

  it('hash: should print computed hash for current rules', async () => {
    const {hash: expected} = computeRulesHash('.rules')
    const logSpy = vi.spyOn(console, 'log')

    await Hash.run([])

    const output = logSpy.mock.calls.map(call => call[0]).join('\n')
    expect(output).toContain(expected)

    logSpy.mockRestore()
  })

  it('check: should report build needed when .build_hash missing', async () => {
    const logSpy = vi.spyOn(console, 'log')

    await Check.run([])

    const output = logSpy.mock.calls.map(call => call[0]).join('\n')
    expect(output).toContain('Build is needed')

    logSpy.mockRestore()
  })

  it('check: should report up-to-date after matching stored hash', async () => {
    const {hash} = computeRulesHash('.rules')
    writeFileSync(join('.rules', '.build_hash'), hash)
    const logSpy = vi.spyOn(console, 'log')

    await Check.run([])

    const output = logSpy.mock.calls.map(call => call[0]).join('\n')
    expect(output).toContain('Up-to-date')

    logSpy.mockRestore()
  })

  it('check: should detect mismatch when rules change', async () => {
    // Write stored hash first
    const {hash} = computeRulesHash('.rules')
    writeFileSync(join('.rules', '.build_hash'), hash)
    
    // Change a rule file
    writeFileSync(join('.rules', '02-b.md'), '# B changed')
    const logSpy = vi.spyOn(console, 'log')

    await Check.run([])

    const output = logSpy.mock.calls.map(call => call[0]).join('\n')
    expect(output).toContain('hash mismatch')

    logSpy.mockRestore()
  })
})

import {createHash} from 'node:crypto'
import {existsSync, readdirSync, readFileSync} from 'node:fs'
import {join} from 'node:path'

export interface RulesHashResult {
  files: string[]
  hash: string
}

export function listRuleFiles(sourceDir: string): string[] {
  if (!existsSync(sourceDir)) {
    throw new Error(`Source directory ${sourceDir} does not exist`)
  }

  return readdirSync(sourceDir)
    .filter(file => file.endsWith('.md') || file.endsWith('.yaml'))
    .sort()
}

export function computeRulesHash(sourceDir: string): RulesHashResult {
  const files = listRuleFiles(sourceDir)
  const hash = createHash('sha256')
  for (const file of files) {
    const path = join(sourceDir, file)
    const content = readFileSync(path, 'utf8')
    hash.update(content)
  }

  return {files, hash: hash.digest('hex')}
}

export function readStoredBuildHash(sourceDir: string): null | string {
  const path = join(sourceDir, '.build_hash')
  if (!existsSync(path)) return null
  try {
    return readFileSync(path, 'utf8').trim()
  } catch {
    return null
  }
}

export function compareHashes(sourceDir: string): {
  computed: string
  needsBuild: boolean
  stored: null | string
} {
  const {hash: computed} = computeRulesHash(sourceDir)
  const stored = readStoredBuildHash(sourceDir)
  return {
    computed,
    needsBuild: !stored || stored !== computed,
    stored,
  }
}

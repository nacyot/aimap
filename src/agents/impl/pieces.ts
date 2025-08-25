import {existsSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import type {AgentSpec} from '../types.js'

const pieces: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputFile = 'pieces.toml'
    
    if (verbose) {
      console.log(`Building Pieces for Developers config at ${outputFile}`)
    }

    if (!dryRun) {
      // Build rules content
      const rulesContent = files
        .filter(file => file.endsWith('.md'))
        .map(file => readFileSync(join(sourceDir, file), 'utf8'))
        
      // Create Pieces TOML config
      const config = [
        '[project]',
        'version = "1.0"',
        '',
        '# Project rules',
        `rules = [`,
        ...rulesContent.map(content => `  """${content.replaceAll('"""', String.raw`\"""`)}""",`),
        ']',
        '',
        '[context]',
        'profiles = ["default"]',
      ].join('\n')
      
      writeFileSync(outputFile, config, 'utf8')
    }
  },
  clean() {
    if (existsSync('pieces.toml')) {
      rmSync('pieces.toml')
    }
  },
  displayName: 'Pieces for Developers',
  id: 'pieces',
  outputPaths: ['pieces.toml'],
}

export default pieces
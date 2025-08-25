import {existsSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import type {AgentSpec} from '../types.js'

const codex: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputPath = 'CODEX.md'
    
    if (verbose) {
      console.log(`Building Codex rules at ${outputPath}`)
    }

    if (!dryRun) {
      const content = files
        .filter(file => file.endsWith('.md'))
        .map(file => readFileSync(join(sourceDir, file), 'utf8'))
        .join('\n\n')
      
      writeFileSync(outputPath, content, 'utf8')
    }
  },
  clean() {
    if (existsSync('CODEX.md')) {
      rmSync('CODEX.md')
    }
  },
  displayName: 'Codex',
  id: 'codex',
  outputPaths: ['CODEX.md'],
}

export default codex
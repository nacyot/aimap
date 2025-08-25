import {existsSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import type {AgentSpec} from '../types.js'

const agents: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputPath = 'AGENTS.md'
    
    if (verbose) {
      console.log(`Building universal agents rules at ${outputPath}`)
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
    if (existsSync('AGENTS.md')) {
      rmSync('AGENTS.md')
    }
  },
  displayName: 'Universal Agents',
  id: 'agents',
  outputPaths: ['AGENTS.md'],
}

export default agents
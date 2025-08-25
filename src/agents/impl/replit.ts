import {existsSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import type {AgentSpec} from '../types.js'

const replit: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputFile = 'replit.md'
    
    if (verbose) {
      console.log(`Building Replit AI rules at ${outputFile}`)
    }

    if (!dryRun) {
      const content = files
        .filter(file => file.endsWith('.md'))
        .map(file => readFileSync(join(sourceDir, file), 'utf8'))
        .join('\n\n')
      
      writeFileSync(outputFile, content, 'utf8')
    }
  },
  clean() {
    if (existsSync('replit.md')) {
      rmSync('replit.md')
    }
  },
  displayName: 'Replit AI',
  id: 'replit',
  outputPaths: ['replit.md'],
}

export default replit
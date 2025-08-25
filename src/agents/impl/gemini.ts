import {existsSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import type {AgentSpec} from '../types.js'

const gemini: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputFile = 'GEMINI.md'  // Auto-loaded by Gemini CLI
    
    if (verbose) {
      console.log(`Building Gemini CLI rules at ${outputFile}`)
    }

    if (!dryRun) {
      // Build combined markdown content for GEMINI.md
      const rulesContent = files
        .filter(file => file.endsWith('.md'))
        .map(file => readFileSync(join(sourceDir, file), 'utf8'))
        .join('\n\n')
      
      // Write GEMINI.md (automatically loaded by Gemini CLI)
      writeFileSync(outputFile, rulesContent, 'utf8')
    }
  },
  clean() {
    if (existsSync('GEMINI.md')) {
      rmSync('GEMINI.md')
    }
  },
  displayName: 'Gemini CLI',
  id: 'gemini',
  outputPaths: ['GEMINI.md'],
}

export default gemini
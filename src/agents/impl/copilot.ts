import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import type {AgentSpec} from '../types.js'

const copilot: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputDir = '.github'
    const outputFile = join(outputDir, 'copilot-instructions.md')
    
    if (verbose) {
      console.log(`Building GitHub Copilot rules at ${outputFile}`)
    }

    if (!dryRun) {
      mkdirSync(outputDir, {recursive: true})
      
      const content = files
        .filter(file => file.endsWith('.md'))
        .map(file => readFileSync(join(sourceDir, file), 'utf8'))
        .join('\n\n')
      
      writeFileSync(outputFile, content, 'utf8')
    }
  },
  clean() {
    if (existsSync('.github/copilot-instructions.md')) {
      rmSync('.github/copilot-instructions.md')
    }
  },
  displayName: 'GitHub Copilot',
  id: 'copilot',
  outputPaths: ['.github/copilot-instructions.md'],
}

export default copilot
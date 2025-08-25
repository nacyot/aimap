import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import type {AgentSpec} from '../types.js'

const cline: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputDir = '.clinerules'
    
    if (verbose) {
      console.log(`Building Cline rules at ${outputDir}/`)
    }

    if (!dryRun) {
      mkdirSync(outputDir, {recursive: true})
      
      for (const file of files) {
        if (file.endsWith('.md')) {
          const content = readFileSync(join(sourceDir, file), 'utf8')
          writeFileSync(join(outputDir, file), content, 'utf8')
        }
      }
    }
  },
  clean() {
    if (existsSync('.clinerules')) {
      rmSync('.clinerules', {force: true, recursive: true})
    }
  },
  displayName: 'Cline',
  id: 'cline',
  outputPaths: ['.clinerules/'],
}

export default cline
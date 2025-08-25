import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import type {AgentSpec} from '../types.js'

const amazonq: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputDir = '.amazonq/rules'
    
    if (verbose) {
      console.log(`Building Amazon Q rules at ${outputDir}/`)
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
    if (existsSync('.amazonq')) {
      rmSync('.amazonq', {force: true, recursive: true})
    }
  },
  displayName: 'Amazon Q',
  id: 'amazonq',
  outputPaths: ['.amazonq/rules/'],
}

export default amazonq
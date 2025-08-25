import {existsSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import type {AgentSpec} from '../types.js'

const cody: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputFile = '.cody.json'
    
    if (verbose) {
      console.log(`Building Sourcegraph Cody config at ${outputFile}`)
    }

    if (!dryRun) {
      // Build rules content
      const rulesContent = files
        .filter(file => file.endsWith('.md'))
        .map(file => readFileSync(join(sourceDir, file), 'utf8'))
        .join('\n\n')
      
      // Create Cody config
      const config = {
        codebase: {
          context: {
            rules: rulesContent,
          },
        },
        version: '1.0',
      }
      
      writeFileSync(outputFile, JSON.stringify(config, null, 2), 'utf8')
    }
  },
  clean() {
    if (existsSync('.cody.json')) {
      rmSync('.cody.json')
    }
  },
  displayName: 'Sourcegraph Cody',
  id: 'cody',
  outputPaths: ['.cody.json'],
}

export default cody
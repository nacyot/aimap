import {existsSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import * as yaml from 'yaml'

import type {AgentSpec} from '../types.js'

const tabby: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputFile = 'tabby.yaml'
    
    if (verbose) {
      console.log(`Building Tabby ML config at ${outputFile}`)
    }

    if (!dryRun) {
      // Build rules content
      const rulesContent = files
        .filter(file => file.endsWith('.md'))
        .map(file => readFileSync(join(sourceDir, file), 'utf8'))
        .join('\n\n')
      
      // Create Tabby YAML config
      const config = {
        assist: {
          rules: rulesContent,
        },
        server: {
          endpoint: 'http://localhost:8080',
        },
        version: '1.0',
      }
      
      writeFileSync(outputFile, yaml.stringify(config), 'utf8')
    }
  },
  clean() {
    if (existsSync('tabby.yaml')) {
      rmSync('tabby.yaml')
    }
  },
  displayName: 'Tabby ML',
  id: 'tabby',
  outputPaths: ['tabby.yaml'],
}

export default tabby
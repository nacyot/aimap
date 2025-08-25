import {existsSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import * as yaml from 'yaml'

import type {AgentSpec} from '../types.js'

const aider: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputFile = '.aider.conf.yml'
    
    if (verbose) {
      console.log(`Building Aider config at ${outputFile}`)
    }

    if (!dryRun) {
      // Build rules content
      const rulesContent = files
        .filter(file => file.endsWith('.md'))
        .map(file => readFileSync(join(sourceDir, file), 'utf8'))
        .join('\n\n')
      
      // Create Aider config with conventions
      const config = {
        'auto-commits': false,
        'chat-language': 'en',
        conventions: rulesContent,
        'dark-mode': true,
        'map-tokens': 1024,
        model: 'gpt-4',
      }
      
      writeFileSync(outputFile, yaml.stringify(config), 'utf8')
    }
  },
  clean() {
    if (existsSync('.aider.conf.yml')) {
      rmSync('.aider.conf.yml')
    }
  },
  displayName: 'Aider',
  id: 'aider',
  outputPaths: ['.aider.conf.yml'],
}

export default aider
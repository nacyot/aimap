import {existsSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import type {AgentSpec} from '../types.js'

const continueAgent: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputFile = '.continuerc.json'
    
    if (verbose) {
      console.log(`Building Continue.dev config at ${outputFile}`)
    }

    if (!dryRun) {
      // Build rules content
      const rulesContent = files
        .filter(file => file.endsWith('.md'))
        .map(file => readFileSync(join(sourceDir, file), 'utf8'))
        .join('\n\n')
      
      // Create Continue config with rules in systemMessage
      const config = {
        customCommands: [],
        docs: [],
        models: [],
        rules: rulesContent,
        systemMessage: rulesContent,
        tabAutocompleteModel: {
          apiBase: '',
          model: '',
          provider: '',
          title: 'Tab Autocomplete',
        },
      }
      
      writeFileSync(outputFile, JSON.stringify(config, null, 2), 'utf8')
    }
  },
  clean() {
    if (existsSync('.continuerc.json')) {
      rmSync('.continuerc.json')
    }
  },
  displayName: 'Continue.dev',
  id: 'continue',
  outputPaths: ['.continuerc.json'],
}

export default continueAgent
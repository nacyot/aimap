import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import * as yaml from 'yaml'

import type {AgentSpec} from '../types.js'

const continueAgent: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputDir = '.continue'
    const outputFile = join(outputDir, 'config.yaml')
    
    if (verbose) {
      console.log(`Building Continue.dev config at ${outputFile}`)
    }

    if (!dryRun) {
      mkdirSync(outputDir, {recursive: true})
      
      // Build rules content
      const rulesContent = files
        .filter(file => file.endsWith('.md'))
        .map(file => readFileSync(join(sourceDir, file), 'utf8'))
        .join('\n\n')
      
      // Create Continue config with new YAML structure (v0.10+)
      const config = {
        context: {
          providers: [],
        },
        models: [],
        prompts: [], // renamed from customCommands
        rules: [rulesContent], // now an array of strings
        tabAutocompleteModel: {
          apiBase: '',
          model: '',
          provider: '',
          title: 'Tab Autocomplete',
        },
      }
      
      writeFileSync(outputFile, yaml.stringify(config), 'utf8')
    }
  },
  clean() {
    if (existsSync('.continue')) {
      rmSync('.continue', {force: true, recursive: true})
    }
  },
  displayName: 'Continue.dev',
  id: 'continue',
  outputPaths: ['.continue/config.yaml'],
}

export default continueAgent
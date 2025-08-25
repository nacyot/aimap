import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import * as yaml from 'yaml'

import type {AgentSpec} from '../types.js'

const gemini: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputDir = '.gemini'
    const outputFile = join(outputDir, 'rules.yaml')
    
    if (verbose) {
      console.log(`Building Google Gemini Code Assist rules at ${outputFile}`)
    }

    if (!dryRun) {
      mkdirSync(outputDir, {recursive: true})
      
      // Build rules content
      const rulesContent = files
        .filter(file => file.endsWith('.md'))
        .map(file => readFileSync(join(sourceDir, file), 'utf8'))
        .join('\n\n')
      
      // Create Gemini config with YAML structure
      const config = {
        apiVersion: 'v1',
        maxContextTokens: 8000,
        rules: rulesContent,
        version: '1.0',
      }
      
      writeFileSync(outputFile, yaml.stringify(config), 'utf8')
    }
  },
  clean() {
    if (existsSync('.gemini')) {
      rmSync('.gemini', {force: true, recursive: true})
    }
  },
  displayName: 'Google Gemini Code Assist',
  id: 'gemini',
  outputPaths: ['.gemini/rules.yaml'],
}

export default gemini
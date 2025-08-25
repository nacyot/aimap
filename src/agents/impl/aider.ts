import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import * as yaml from 'yaml'

import type {AgentSpec} from '../types.js'

const aider: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputFile = '.aider.conf.yml'
    const rulesDir = '.aider-rules'
    
    if (verbose) {
      console.log(`Building Aider config at ${outputFile}`)
    }

    if (!dryRun) {
      // Create a directory for aider rules
      mkdirSync(rulesDir, {recursive: true})
      
      // Copy rule files to .aider-rules directory
      const ruleFiles: string[] = []
      for (const file of files) {
        if (file.endsWith('.md')) {
          const content = readFileSync(join(sourceDir, file), 'utf8')
          const outputPath = join(rulesDir, file)
          writeFileSync(outputPath, content, 'utf8')
          ruleFiles.push(outputPath)
        }
      }
      
      // Create Aider config with read field pointing to rule files
      const config = {
        'auto-commits': false,
        'chat-language': 'en',
        'dark-mode': true,
        'map-tokens': 1024,
        model: 'gpt-4',
        read: ruleFiles, // Use read field to reference rule files
      }
      
      writeFileSync(outputFile, yaml.stringify(config), 'utf8')
    }
  },
  clean() {
    if (existsSync('.aider.conf.yml')) {
      rmSync('.aider.conf.yml')
    }

    if (existsSync('.aider-rules')) {
      rmSync('.aider-rules', {force: true, recursive: true})
    }
  },
  displayName: 'Aider',
  id: 'aider',
  outputPaths: ['.aider.conf.yml', '.aider-rules/'],
}

export default aider
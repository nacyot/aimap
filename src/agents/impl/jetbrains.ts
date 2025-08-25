import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import type {AgentSpec} from '../types.js'

const jetbrains: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputDir = '.aiassistant/rules'
    
    if (verbose) {
      console.log(`Building JetBrains AI Assistant rules at ${outputDir}/`)
    }

    if (!dryRun) {
      mkdirSync(outputDir, {recursive: true})
      
      // Copy each markdown file to .aiassistant/rules/
      for (const file of files) {
        if (file.endsWith('.md')) {
          const content = readFileSync(join(sourceDir, file), 'utf8')
          writeFileSync(join(outputDir, file), content, 'utf8')
        }
      }
    }
  },
  clean() {
    if (existsSync('.aiassistant')) {
      rmSync('.aiassistant', {force: true, recursive: true})
    }
  },
  displayName: 'JetBrains AI Assistant',
  id: 'jetbrains',
  outputPaths: ['.aiassistant/rules/'],
}

export default jetbrains
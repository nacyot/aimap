import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import type {AgentSpec} from '../types.js'

const jetbrains: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputDir = '.jbai'
    const outputFile = join(outputDir, 'rules.md')
    
    if (verbose) {
      console.log(`Building JetBrains AI Assistant rules at ${outputFile}`)
    }

    if (!dryRun) {
      mkdirSync(outputDir, {recursive: true})
      
      const content = files
        .filter(file => file.endsWith('.md'))
        .map(file => readFileSync(join(sourceDir, file), 'utf8'))
        .join('\n\n')
      
      writeFileSync(outputFile, content, 'utf8')
    }
  },
  clean() {
    if (existsSync('.jbai')) {
      rmSync('.jbai', {force: true, recursive: true})
    }
  },
  displayName: 'JetBrains AI Assistant',
  id: 'jetbrains',
  outputPaths: ['.jbai/rules.md'],
}

export default jetbrains
import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import type {AgentSpec} from '../types.js'

const cursor: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputDir = '.cursor'
    const outputFile = join(outputDir, 'rules')
    
    if (verbose) {
      console.log(`Building Cursor rules at ${outputFile}`)
    }

    if (!dryRun) {
      mkdirSync(outputDir, {recursive: true})
      
      const content = files
        .filter(file => file.endsWith('.md'))
        .map(file => readFileSync(join(sourceDir, file), 'utf8'))
        .join('\n\n')
      
      writeFileSync(outputFile, content, 'utf8')
      
      // Also create .cursorrules for compatibility
      writeFileSync('.cursorrules', content, 'utf8')
    }
  },
  clean() {
    if (existsSync('.cursor')) {
      rmSync('.cursor', {force: true, recursive: true})
    }

    if (existsSync('.cursorrules')) {
      rmSync('.cursorrules')
    }
  },
  displayName: 'Cursor',
  id: 'cursor',
  outputPaths: ['.cursor/rules', '.cursorrules'],
}

export default cursor
import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import type {AgentSpec} from '../types.js'

const MAX_FILE_SIZE = 32_768 // 32KB limit for Amazon Q

const amazonq: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputDir = '.amazonq/rules'
    
    if (verbose) {
      console.log(`Building Amazon Q Developer rules at ${outputDir}/`)
    }

    if (!dryRun) {
      mkdirSync(outputDir, {recursive: true})
      
      // Copy each markdown file to .amazonq/rules/
      for (const file of files) {
        if (file.endsWith('.md')) {
          const content = readFileSync(join(sourceDir, file), 'utf8')
          const contentSize = Buffer.byteLength(content, 'utf8')
          
          if (contentSize > MAX_FILE_SIZE) {
            console.warn(`Warning: ${file} is ${contentSize} bytes (max: ${MAX_FILE_SIZE} bytes)`)
          }
          
          writeFileSync(join(outputDir, file), content, 'utf8')
        }
      }
    }
  },
  clean() {
    if (existsSync('.amazonq')) {
      rmSync('.amazonq', {force: true, recursive: true})
    }
  },
  displayName: 'Amazon Q Developer',
  id: 'amazonq',
  outputPaths: ['.amazonq/rules/'],
}

export default amazonq
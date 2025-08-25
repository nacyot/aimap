import {existsSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import type {AgentSpec} from '../types.js'

const MAX_FILE_SIZE = 6000 // 6KB limit for Windsurf

const windsurf: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputFile = '.windsurfrules'
    
    if (verbose) {
      console.log(`Building Windsurf/Codeium rules at ${outputFile}`)
    }

    if (!dryRun) {
      const content = files
        .filter(file => file.endsWith('.md'))
        .map(file => readFileSync(join(sourceDir, file), 'utf8'))
        .join('\n\n')
      
      // Check file size and warn if too large
      const contentSize = Buffer.byteLength(content, 'utf8')
      if (contentSize > MAX_FILE_SIZE) {
        console.warn(`Warning: .windsurfrules is ${contentSize} bytes (max: ${MAX_FILE_SIZE} bytes)`)
        console.warn('Content will be truncated by Windsurf')
      }
      
      // Write .windsurfrules (official location)
      writeFileSync(outputFile, content, 'utf8')
    }
  },
  clean() {
    if (existsSync('.windsurfrules')) {
      rmSync('.windsurfrules')
    }
  },
  displayName: 'Windsurf/Codeium',
  id: 'windsurf',
  outputPaths: ['.windsurfrules'],
}

export default windsurf
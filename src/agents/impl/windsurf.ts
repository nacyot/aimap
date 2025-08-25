import {existsSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import type {AgentSpec} from '../types.js'

const MAX_FILE_SIZE = 6000 // 6KB hard limit for Windsurf (content ignored if exceeded)

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
      
      // Check file size and warn if exceeds limit
      const contentSize = Buffer.byteLength(content, 'utf8')
      if (contentSize > MAX_FILE_SIZE) {
        console.warn(`⚠️  Warning: .windsurfrules is ${contentSize} bytes, exceeding Windsurf's ${MAX_FILE_SIZE} byte limit.`)
        console.warn('⚠️  Windsurf will ignore the entire file since it exceeds 6KB.')
        console.warn('⚠️  Consider reducing the size of your rules or excluding some files.')
      } else if (contentSize > MAX_FILE_SIZE * 0.9) {
        console.warn(`⚠️  Warning: .windsurfrules is ${contentSize} bytes (90% of ${MAX_FILE_SIZE} byte limit)`)
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
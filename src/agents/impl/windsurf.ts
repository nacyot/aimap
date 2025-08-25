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
      
      // Check file size - fail if exceeds hard limit (2025: content ignored, not truncated)
      const contentSize = Buffer.byteLength(content, 'utf8')
      if (contentSize > MAX_FILE_SIZE) {
        const error = `Error: Combined rules are ${contentSize} bytes, exceeding Windsurf's ${MAX_FILE_SIZE} byte limit.`
        console.error(error)
        console.error('Windsurf will ignore the entire file if it exceeds 6KB.')
        console.error('Please reduce the size of your rules or exclude some files.')
        throw new Error(error)
      }
      
      // Warn if approaching limit
      if (contentSize > MAX_FILE_SIZE * 0.9) {
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
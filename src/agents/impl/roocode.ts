import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import type {AgentSpec} from '../types.js'

const roocode: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputDir = '.roo'
    
    if (verbose) {
      console.log(`Building RooCode rules at ${outputDir}/`)
    }

    if (!dryRun) {
      mkdirSync(outputDir, {recursive: true})
      
      for (const file of files) {
        if (file.endsWith('.md')) {
          const content = readFileSync(join(sourceDir, file), 'utf8')
          writeFileSync(join(outputDir, file), content, 'utf8')
        }
      }
    }
  },
  clean() {
    if (existsSync('.roo')) {
      rmSync('.roo', {force: true, recursive: true})
    }
  },
  displayName: 'RooCode',
  id: 'roocode',
  outputPaths: ['.roo/'],
}

export default roocode
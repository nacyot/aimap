import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import type {AgentSpec} from '../types.js'

const windsurf: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputDir = '.windsurf'
    const outputFile = join(outputDir, 'rules')
    
    if (verbose) {
      console.log(`Building Windsurf rules at ${outputFile}`)
    }

    if (!dryRun) {
      mkdirSync(outputDir, {recursive: true})
      
      const content = files
        .filter(file => file.endsWith('.md'))
        .map(file => readFileSync(join(sourceDir, file), 'utf8'))
        .join('\n\n')
      
      writeFileSync(outputFile, content, 'utf8')
      
      // Also create .windsurfrules for compatibility
      writeFileSync('.windsurfrules', content, 'utf8')
    }
  },
  clean() {
    if (existsSync('.windsurf')) {
      rmSync('.windsurf', {force: true, recursive: true})
    }

    if (existsSync('.windsurfrules')) {
      rmSync('.windsurfrules')
    }
  },
  displayName: 'Windsurf',
  id: 'windsurf',
  outputPaths: ['.windsurf/rules', '.windsurfrules'],
}

export default windsurf
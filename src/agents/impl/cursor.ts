import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import type {AgentSpec} from '../types.js'

const cursor: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputDir = '.cursor'
    const mainRuleFile = join(outputDir, 'rules')
    
    if (verbose) {
      console.log(`Building Cursor rules at ${mainRuleFile}`)
    }

    if (!dryRun) {
      mkdirSync(outputDir, {recursive: true})
      
      // Create main rules file with all content
      const content = files
        .filter(file => file.endsWith('.md'))
        .map(file => readFileSync(join(sourceDir, file), 'utf8'))
        .join('\n\n')
      
      // Write to .cursor/rules (canonical location as of 2025)
      writeFileSync(mainRuleFile, content, 'utf8')
      
      // Optionally create .cursorrules for backward compatibility
      // (can be removed once all team members upgrade)
      if (verbose) {
        console.log('Creating .cursorrules for backward compatibility')
      }

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
  displayName: 'Cursor IDE',
  id: 'cursor',
  outputPaths: ['.cursor/rules', '.cursorrules'],
}

export default cursor
import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import type {AgentSpec} from '../types.js'

const cursor: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const rulesDir = '.cursor/rules'
    
    if (verbose) {
      console.log(`Building Cursor rules at ${rulesDir}/`)
    }

    if (!dryRun) {
      // Create .cursor/rules/ directory (official 2025 location)
      mkdirSync(rulesDir, {recursive: true})
      
      // Copy each markdown file to .cursor/rules/ directory with .mdc extension
      // Cursor v0.52+ requires .mdc extension (Markdown + Code) not .md
      for (const file of files) {
        if (file.endsWith('.md')) {
          const content = readFileSync(join(sourceDir, file), 'utf8')
          // Change extension from .md to .mdc for 2025 compliance
          const mdcFile = file.replace(/\.md$/, '.mdc')
          writeFileSync(join(rulesDir, mdcFile), content, 'utf8')
          
          if (verbose) {
            console.log(`Created ${join(rulesDir, mdcFile)}`)
          }
        }
      }
      
      // Also create .cursorrules for backward compatibility (deprecated but still works)
      // Combine all rules into single file for legacy support
      const legacyContent = files
        .filter(file => file.endsWith('.md'))
        .map(file => readFileSync(join(sourceDir, file), 'utf8'))
        .join('\n\n')
      
      writeFileSync('.cursorrules', legacyContent, 'utf8')
      
      if (verbose) {
        console.log('Created .cursorrules for backward compatibility')
        console.log('⚠️  Note: .cursorrules is deprecated and will be removed in Cursor v0.60 (Q2 2026)')
      }
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
  outputPaths: ['.cursor/rules/', '.cursorrules'],
}

export default cursor
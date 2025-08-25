import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {basename, join} from 'node:path'

import type {AgentSpec} from '../types.js'

const copilot: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputDir = '.github'
    const instructionsDir = join(outputDir, 'instructions')
    
    if (verbose) {
      console.log(`Building GitHub Copilot rules in ${instructionsDir}/`)
    }

    if (!dryRun) {
      mkdirSync(instructionsDir, {recursive: true})
      
      // Copy each rule file as a granular instruction
      for (const file of files) {
        if (file.endsWith('.md')) {
          const content = readFileSync(join(sourceDir, file), 'utf8')
          const instructionFile = basename(file, '.md') + '.instructions.md'
          const outputPath = join(instructionsDir, instructionFile)
          
          // Add applyTo front matter if not present
          let finalContent = content
          if (!content.startsWith('---')) {
            // Apply to all files by default
            finalContent = `---
applyTo: "**"
---

${content}`
          }
          
          writeFileSync(outputPath, finalContent, 'utf8')
          
          if (verbose) {
            console.log(`Created ${outputPath}`)
          }
        }
      }
    }
  },
  clean() {
    if (existsSync('.github/copilot-instructions.md')) {
      rmSync('.github/copilot-instructions.md')
    }
    
    if (existsSync('.github/instructions')) {
      rmSync('.github/instructions', {force: true, recursive: true})
    }
  },
  displayName: 'GitHub Copilot',
  id: 'copilot',
  outputPaths: ['.github/instructions/'],
}

export default copilot
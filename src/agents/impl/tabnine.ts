import {existsSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import type {AgentSpec} from '../types.js'

const tabnine: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputFile = '.tabnine'
    
    if (verbose) {
      console.log(`Building Tabnine config at ${outputFile}`)
    }

    if (!dryRun) {
      // Build rules content for project context
      const rulesContent = files
        .filter(file => file.endsWith('.md'))
        .map(file => readFileSync(join(sourceDir, file), 'utf8'))
        .join('\n\n')
      
      // Create Tabnine project configuration
      const config = {
        disableTeamLearning: false,
        projectContext: rulesContent,
        teamLearningIgnore: [
          'node_modules',
          '.git',
          'dist',
          'build',
        ],
      }
      
      writeFileSync(outputFile, JSON.stringify(config, null, 2), 'utf8')
    }
  },
  clean() {
    if (existsSync('.tabnine')) {
      rmSync('.tabnine')
    }
  },
  displayName: 'Tabnine',
  id: 'tabnine',
  outputPaths: ['.tabnine'],
}

export default tabnine
import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import * as yaml from 'yaml'

import type {AgentSpec} from '../types.js'

const workspace: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputDir = '.workspace'
    const outputFile = join(outputDir, 'rules.yaml')
    
    if (verbose) {
      console.log(`Building GitHub Copilot Workspace rules at ${outputFile}`)
    }

    if (!dryRun) {
      mkdirSync(outputDir, {recursive: true})
      
      // Build rules content
      const rulesContent = files
        .filter(file => file.endsWith('.md'))
        .map(file => readFileSync(join(sourceDir, file), 'utf8'))
        .join('\n\n')
      
      // Create Workspace YAML config for workflows
      const config = {
        apiVersion: 'workspace/v1',
        context: {
          rules: rulesContent,
        },
        metadata: {
          name: 'project-rules',
        },
        workflows: [],
      }
      
      writeFileSync(outputFile, yaml.stringify(config), 'utf8')
    }
  },
  clean() {
    if (existsSync('.workspace')) {
      rmSync('.workspace', {force: true, recursive: true})
    }
  },
  displayName: 'GitHub Copilot Workspace',
  id: 'workspace',
  outputPaths: ['.workspace/rules.yaml'],
}

export default workspace
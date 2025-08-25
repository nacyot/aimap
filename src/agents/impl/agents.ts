import {readFileSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import type {AgentSpec, BuildContext} from '../types.js'

const agentsSpec: AgentSpec = {
  builder: (context: BuildContext) => {
    const {files, sourceDir, dryRun} = context
    
    // Read all rule files and combine them
    const sections = []
    for (const file of files) {
      const content = readFileSync(join(sourceDir, file), 'utf8')
      sections.push(content.trim())
    }
    
    const rulesContent = sections.join('\n\n---\n\n')
    
    if (!dryRun) {
      writeFileSync('AGENTS.md', rulesContent, 'utf8')
    }
  },
  displayName: 'Universal Agents',
  id: 'agents',
  outputPaths: ['AGENTS.md'],
}

export {agentsSpec as agents}
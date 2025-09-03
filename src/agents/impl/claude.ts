import {existsSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join, relative} from 'node:path'

import type {AgentSpec} from '../types.js'

const claude: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputPath = 'CLAUDE.md'
    const templatePath = 'CLAUDE.tempalte.md' // Intentional: support exact filename requested

    // Build list-style references (e.g., "- @.rules/01.md")
    const rulesList = files
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const relativePath = relative(process.cwd(), join(sourceDir, file))
        return `- @${relativePath}`
      })
      .join('\n')

    if (verbose) {
      console.log(`Building Claude rules at ${outputPath}`)
    }

    if (!dryRun) {
      // If a CLAUDE.tempalte.md exists, use it and replace @@RULES@@ with the list
      if (existsSync(templatePath)) {
        const template = readFileSync(templatePath, 'utf8')
        const filled = template.replace('@@RULES@@', rulesList)
        writeFileSync(outputPath, filled, 'utf8')
      } else {
        // Fallback: write just the rules list
        writeFileSync(outputPath, rulesList, 'utf8')
      }
    }
  },
  clean() {
    if (existsSync('CLAUDE.md')) {
      rmSync('CLAUDE.md')
    }
  },
  displayName: 'Claude Code',
  id: 'claude',
  outputPaths: ['CLAUDE.md'],
}

export default claude

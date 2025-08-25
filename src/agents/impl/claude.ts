import {existsSync, rmSync, writeFileSync} from 'node:fs'
import {join, relative} from 'node:path'

import type {AgentSpec} from '../types.js'

const claude: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const outputPath = 'CLAUDE.md'
    const claudeContent = files
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const relativePath = relative(process.cwd(), join(sourceDir, file))
        return `@${relativePath}`
      })
      .join('\n')

    if (verbose) {
      console.log(`Building Claude rules at ${outputPath}`)
    }

    if (!dryRun) {
      writeFileSync(outputPath, claudeContent, 'utf8')
    }
  },
  clean() {
    if (existsSync('CLAUDE.md')) {
      rmSync('CLAUDE.md')
    }
  },
  displayName: 'Claude',
  id: 'claude',
  outputPaths: ['CLAUDE.md'],
}

export default claude
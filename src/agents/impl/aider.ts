import {existsSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import * as yaml from 'yaml'

import type {AgentSpec} from '../types.js'

const aider: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const configFile = '.aider.conf.yml'
    
    if (verbose) {
      console.log(`Updating Aider config at ${configFile}`)
      console.log(`Adding rules from ${sourceDir}`)
    }

    if (!dryRun) {
      // Build list of rule file paths from sourceDir
      const ruleFiles: string[] = []
      for (const file of files) {
        if (file.endsWith('.md')) {
          // Use sourceDir paths directly without copying
          ruleFiles.push(join(sourceDir, file))
        }
      }
      
      // Update or create .aider.conf.yml
      let config: Record<string, unknown> = {}
      
      // If config exists, preserve existing settings
      if (existsSync(configFile)) {
        try {
          const existingContent = readFileSync(configFile, 'utf8')
          config = yaml.parse(existingContent) || {}
        } catch {
          // If parsing fails, start with empty config
          config = {}
        }
      }
      
      // Update the read field with all rule files
      config.read = ruleFiles
      
      // Write updated config
      writeFileSync(configFile, yaml.stringify(config), 'utf8')
    }
  },
  clean() {
    // Remove .aider.conf.yml or clear the read array
    const configFile = '.aider.conf.yml'
    if (existsSync(configFile)) {
      try {
        const content = readFileSync(configFile, 'utf8')
        const config = yaml.parse(content)
        
        if (config && config.read) {
          // Clear the read array completely
          delete config.read
        }
        
        // Only write back if there are other settings
        if (Object.keys(config).length > 0) {
          writeFileSync(configFile, yaml.stringify(config), 'utf8')
        } else {
          // Remove empty config file
          rmSync(configFile)
        }
      } catch {
        // Ignore errors during cleanup
      }
    }
    
    // Note: We don't remove .rules directory as it's the source directory
  },
  displayName: 'Aider',
  id: 'aider',
  outputPaths: ['.aider.conf.yml'],
}

export default aider
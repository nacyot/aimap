import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import * as yaml from 'yaml'

import type {AgentSpec} from '../types.js'

const aider: AgentSpec = {
  builder({dryRun, files, sourceDir, verbose}) {
    const configFile = '.aider.conf.yml'
    const rulesDir = '.rules'
    
    if (verbose) {
      console.log(`Building Aider rules in ${rulesDir}/`)
      console.log(`Updating Aider config at ${configFile}`)
    }

    if (!dryRun) {
      // Create .rules directory if it doesn't exist
      mkdirSync(rulesDir, {recursive: true})
      
      // Copy all markdown files to .rules directory
      const ruleFiles: string[] = []
      for (const file of files) {
        if (file.endsWith('.md')) {
          const content = readFileSync(join(sourceDir, file), 'utf8')
          const outputPath = join(rulesDir, file)
          writeFileSync(outputPath, content, 'utf8')
          ruleFiles.push(outputPath)
        }
      }
      
      // Update or create .aider.conf.yml
      let config: any = {}
      
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
    // Remove rule files from .aider.conf.yml if it exists
    const configFile = '.aider.conf.yml'
    if (existsSync(configFile)) {
      try {
        const content = readFileSync(configFile, 'utf8')
        const config = yaml.parse(content)
        
        if (config && config.read) {
          // Filter out .rules/* files
          if (Array.isArray(config.read)) {
            config.read = config.read.filter((f: string) => !f.startsWith('.rules/'))
            if (config.read.length === 0) {
              delete config.read
            }
          }
          
          // Only write back if there are other settings
          if (Object.keys(config).length > 0) {
            writeFileSync(configFile, yaml.stringify(config), 'utf8')
          } else {
            // Remove empty config file
            rmSync(configFile)
          }
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
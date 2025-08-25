import {existsSync, readFileSync} from 'node:fs'
import * as yaml from 'yaml'

export interface AimapConfig {
  agents: string[]
  outputs?: {
    [key: string]: string
  }
  source: string
}

const DEFAULT_CONFIG: AimapConfig = {
  agents: [
    'claude',
    'cline',
    'roocode',
    'cursor',
    'windsurf',
    'codex',
    'copilot',
    'amazonq',
    'continue',
    'aider',
    'tabnine',
    'replit',
  ],
  source: '.rules',
}

export class ConfigLoader {
  private configPath: string

  constructor(configPath = '.aimap.yml') {
    this.configPath = configPath
  }

  exists(): boolean {
    return existsSync(this.configPath)
  }

  load(): AimapConfig {
    if (!existsSync(this.configPath)) {
      return DEFAULT_CONFIG
    }

    try {
      const content = readFileSync(this.configPath, 'utf8')
      const config = yaml.parse(content) as Partial<AimapConfig>
      
      return {
        agents: config.agents || DEFAULT_CONFIG.agents,
        outputs: config.outputs,
        source: config.source || DEFAULT_CONFIG.source,
      }
    } catch {
      console.warn(`Warning: Failed to parse ${this.configPath}, using defaults`)
      return DEFAULT_CONFIG
    }
  }
}
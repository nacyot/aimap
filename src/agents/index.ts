// Import all agent implementations
import {agents} from './impl/agents.js'
import aider from './impl/aider.js'
import amazonq from './impl/amazonq.js'
import claude from './impl/claude.js'
import cline from './impl/cline.js'
import copilot from './impl/copilot.js'
import cursor from './impl/cursor.js'
import gemini from './impl/gemini.js'
import jetbrains from './impl/jetbrains.js'
import roocode from './impl/roocode.js'
import windsurf from './impl/windsurf.js'
import {register} from './registry.js'

// Register all agents
export function registerAllAgents(): void {
  register(agents)
  register(aider)
  register(amazonq)
  register(claude)
  register(cline)
  register(copilot)
  register(cursor)
  register(gemini)
  register(jetbrains)
  register(roocode)
  register(windsurf)
}

// Export registry functions
export * from './registry.js'
export * from './types.js'

// Auto-register on import
registerAllAgents()
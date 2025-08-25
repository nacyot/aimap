// Import all agent implementations
import aider from './impl/aider.js'
import amazonq from './impl/amazonq.js'
import claude from './impl/claude.js'
import cline from './impl/cline.js'
import codex from './impl/codex.js'
import continueAgent from './impl/continue.js'
import copilot from './impl/copilot.js'
import cursor from './impl/cursor.js'
import replit from './impl/replit.js'
import roocode from './impl/roocode.js'
import tabnine from './impl/tabnine.js'
import windsurf from './impl/windsurf.js'
import {register} from './registry.js'

// Register all agents
export function registerAllAgents(): void {
  register(aider)
  register(amazonq)
  register(claude)
  register(cline)
  register(codex)
  register(continueAgent)
  register(copilot)
  register(cursor)
  register(replit)
  register(roocode)
  register(tabnine)
  register(windsurf)
}

// Export registry functions
export * from './registry.js'
export * from './types.js'

// Auto-register on import
registerAllAgents()
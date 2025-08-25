// Import all agent implementations
import agents from './impl/agents.js'
import aider from './impl/aider.js'
import amazonq from './impl/amazonq.js'
import claude from './impl/claude.js'
import cline from './impl/cline.js'
import cody from './impl/cody.js'
import continueAgent from './impl/continue.js'
import copilot from './impl/copilot.js'
import cursor from './impl/cursor.js'
import gemini from './impl/gemini.js'
import jetbrains from './impl/jetbrains.js'
import pieces from './impl/pieces.js'
import replit from './impl/replit.js'
import roocode from './impl/roocode.js'
import tabby from './impl/tabby.js'
import tabnine from './impl/tabnine.js'
import windsurf from './impl/windsurf.js'
import workspace from './impl/workspace.js'
import {register} from './registry.js'

// Register all agents
export function registerAllAgents(): void {
  register(agents)
  register(aider)
  register(amazonq)
  register(claude)
  register(cline)
  register(cody)
  register(continueAgent)
  register(copilot)
  register(cursor)
  register(gemini)
  register(jetbrains)
  register(pieces)
  register(replit)
  register(roocode)
  register(tabby)
  register(tabnine)
  register(windsurf)
  register(workspace)
}

// Export registry functions
export * from './registry.js'
export * from './types.js'

// Auto-register on import
registerAllAgents()
import type {AgentRegistry, AgentSpec} from './types.js'

const registry: AgentRegistry = {}

export function register(spec: AgentSpec): void {
  registry[spec.id] = spec
}

export function getAgent(id: string): AgentSpec | undefined {
  return registry[id]
}

export function getAllAgents(): AgentSpec[] {
  return Object.values(registry)
}

export function getAgentIds(): string[] {
  return Object.keys(registry)
}

export function hasAgent(id: string): boolean {
  return id in registry
}

export function clearRegistry(): void {
  for (const key of Object.keys(registry)) {
    delete registry[key]
  }
}
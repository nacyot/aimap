export interface BuildContext {
  dryRun: boolean
  files: string[]
  sourceDir: string
  verbose: boolean
}

export interface AgentSpec {
  builder: (context: BuildContext) => Promise<void> | void
  clean?: () => void
  displayName: string
  id: string
  outputPaths: string[]
}

export type AgentRegistry = Record<string, AgentSpec>
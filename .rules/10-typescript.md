# TypeScript Development Rules

## Type System Usage

1. **Strict Mode**: Always enable strict mode in tsconfig.json
2. **Type Inference**: Let TypeScript infer types when obvious
3. **Explicit Types**: Add types for function parameters and return values
4. **Interfaces vs Types**: Use interfaces for objects, types for unions/aliases

## Code Organization

```typescript
// Good: Clear type definitions
interface MapOptions {
  format: 'json' | 'yaml' | 'csv'
  output?: string
  interactive: boolean
}

// Good: Explicit return types
async function generateMap(data: unknown): Promise<MapResult> {
  // implementation
}

// Bad: Using any
function processData(input: any): any {
  // avoid this
}
```

## Import/Export Rules

1. Use ES modules (import/export)
2. Group imports: external deps, then internal modules
3. Use absolute imports from 'src/' root
4. Export types alongside implementations

## Async Patterns

```typescript
// Good: Error handling with async/await
try {
  const result = await generateMap(data)
  return result
} catch (error) {
  if (error instanceof MapGenerationError) {
    this.error(error.message)
  }
  throw error
}

// Bad: Unhandled promises
generateMap(data) // Missing await or .catch()
```

## oclif-Specific Patterns

1. Use Command class from @oclif/core
2. Define static properties for command metadata
3. Implement run() method for command logic
4. Use this.log() for output, this.error() for errors
5. Parse args and flags using this.parse()
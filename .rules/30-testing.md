# Testing Rules

## Test Framework

- **Framework**: Vitest
- **Coverage**: Aim for >80% code coverage
- **Test Location**: Mirror source structure in `test/` directory

## Test Types

### Unit Tests
- Test individual functions and classes
- Mock external dependencies
- Fast and isolated

### Integration Tests
- Test command execution
- Use oclif test helpers
- Verify actual CLI behavior

### E2E Tests (Future)
- Test full workflows
- Verify generated outputs
- Use real data samples

## Test Structure

```typescript
import {describe, it, expect, beforeEach} from 'vitest'
import Generate from '../../src/commands/generate'

describe('Generate Command', () => {
  beforeEach(() => {
    // Setup
  })

  it('should parse JSON input correctly', async () => {
    // Arrange
    const input = {/* test data */}
    
    // Act
    const result = await Generate.run(['test.json'])
    
    // Assert
    expect(result).toBeDefined()
    expect(result.format).toBe('json')
  })
})
```

## Testing Best Practices

1. **AAA Pattern**: Arrange, Act, Assert
2. **Descriptive Names**: Test names should explain what they test
3. **One Assertion**: Each test should verify one behavior
4. **Test Data**: Use fixtures for complex test data
5. **Mocking**: Mock external services and file system operations

## Coverage Requirements

- Statements: >80%
- Branches: >75%
- Functions: >80%
- Lines: >80%

Run coverage: `npm test -- --coverage`
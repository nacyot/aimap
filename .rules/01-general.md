# General Development Rules

## Code Style and Standards

1. **Language**: TypeScript with strict mode enabled
2. **Formatting**: Use Prettier with single quotes, no semicolons
3. **Linting**: Follow ESLint rules from eslint-config-oclif
4. **Comments**: Write clear, concise comments only when necessary
5. **File naming**: Use kebab-case for files, PascalCase for classes

## Development Principles

1. **Test-Driven Development (TDD)**: Write tests before implementation
2. **Single Responsibility**: Each function/class should do one thing well
3. **Error Handling**: Always handle errors gracefully with meaningful messages
4. **Async/Await**: Prefer async/await over callbacks or raw promises
5. **Type Safety**: Leverage TypeScript's type system fully

## Git Workflow

1. **Commits**: Use conventional commit messages (feat:, fix:, docs:, etc.)
2. **Branches**: Use feature branches with descriptive names
3. **Pull Requests**: Always test before submitting PRs
4. **Code Review**: Address all review comments before merging

## Forbidden Practices

1. **Never** commit sensitive data (API keys, passwords, tokens)
2. **Never** use `any` type without explicit justification
3. **Never** ignore linting errors without fixing them
4. **Never** push directly to main branch
5. **Never** skip tests when implementing features
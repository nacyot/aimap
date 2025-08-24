# aimap

A universal build tool for managing coding agent rules across multiple AI-powered development tools

## Installation

```bash
npm install -g aimap
```

Or use directly with npx:

```bash
npx aimap generate
```

## Usage

### Build rules for all coding agents

```bash
aimap generate
```

### Build for specific agents

```bash
aimap generate --agents claude,cursor
```

### Options

- `-s, --source <dir>` - Source directory for rules [default: .rules]
- `-a, --agents <list>` - Comma-separated list of agents [default: all]
- `-v, --verbose` - Verbose output
- `--dry` - Dry run (show what would be built)

## Supported Coding Agents

- **Claude Code** - Generates `CLAUDE.md` with `@` import syntax
- **Cline** - Copies rules to `.clinerules/` directory
- **RooCode** - Copies rules to `.roo/rules/` directory  
- **Cursor** - Copies rules to `.cursor/rules/` directory
- **Windsurf** - Copies rules to `.windsurf/rules/` directory
- **Codex** - Generates unified `AGENTS.md` file

## Rule Files Structure

Create a `.rules/` directory in your project with markdown files:

```
.rules/
├── 00-meta.yaml      # Project metadata (optional)
├── 01-general.md     # General development rules
├── 10-typescript.md  # Language-specific rules
├── 20-testing.md     # Testing guidelines
└── ...
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Development with watch mode
npm run test:watch
```

## License

MIT
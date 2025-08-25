# aimap

Universal build tool for managing coding agent rules across multiple AI-powered development tools. Support Claude Code, Cursor, Windsurf, GitHub Copilot, Amazon Q, and more.

[![npm version](https://badge.fury.io/js/aimap.svg)](https://badge.fury.io/js/aimap)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install -g aimap
```

Or use directly with npx:

```bash
npx aimap build
```

## Usage

### Build rules for default agent (Claude)

```bash
aimap build  # Generates CLAUDE.md only
```

### Build for specific agents

```bash
aimap build --agents claude,cursor
```

### Clean generated files

```bash
aimap clean           # Clean all generated files
aimap clean --all     # Also remove build hash
```

### Configuration

Create `.aimap.yml` in your project root:

```yaml
# Source directory for rule files
source: .rules

# Agents to build for
agents:
  - claude
  - cursor
  - copilot
  - amazonq

# Custom output paths (optional)
outputs:
  claude: CUSTOM_CLAUDE.md
```

### Options

#### Build command
- `-s, --source <dir>` - Source directory for rules [default: .rules]
- `-a, --agents <list>` - Comma-separated list of agents [default: all]
- `-v, --verbose` - Verbose output
- `--dry` - Dry run (show what would be built)
- `-c, --config <file>` - Path to config file [default: .aimap.yml]

#### Clean command
- `--all` - Remove all generated files including build hash
- `-v, --verbose` - Verbose output
- `-c, --config <file>` - Path to config file [default: .aimap.yml]

## Supported Coding Agents (2025)

| Agent | ID | Output Files | Notes |
|-------|-----|--------------|-------|
| **Universal Agents** | `agents` | `AGENTS.md` | Combined rules for any agent |
| **Claude Code** | `claude` | `CLAUDE.md` | Uses `@` reference syntax |
| **Cursor IDE** | `cursor` | `.cursor/rules/*.mdc`, `.cursorrules` | MDC format (v0.52+) |
| **GitHub Copilot** | `copilot` | `.github/instructions/*.instructions.md` | Granular instructions |
| **Amazon Q** | `amazonq` | `.amazonq/rules/*.md` | 32KB file limit |
| **Aider** | `aider` | `.aider.conf.yml` | Updates read array |
| **Cline** | `cline` | `.clinerules/*.md` | Individual files |
| **RooCode** | `roocode` | `.roo/rules/*.md` | Individual files |
| **Windsurf** | `windsurf` | `.windsurfrules` | 6KB hard limit |
| **JetBrains AI** | `jetbrains` | `.aiassistant/rules/*.md` | Individual files |
| **Gemini CLI** | `gemini` | `GEMINI.md` | Combined rules |

## Quick Start

1. Create a `.rules/` directory in your project:
```bash
mkdir .rules
```

2. Add your coding rules as markdown files:
```bash
echo "# Code Style\n\nUse TypeScript" > .rules/01-style.md
echo "# Testing\n\nWrite unit tests" > .rules/02-testing.md
```

3. Build rules for your agents:
```bash
npx aimap build --agents claude,cursor,windsurf
```

4. Your agents will automatically use the generated files!

## Example

### Project Structure
```
my-project/
├── .rules/
│   ├── 01-coding-style.md
│   ├── 02-architecture.md
│   └── 03-testing.md
├── .aimap.yml              # Optional config
└── ... (generated files after build)
```

### Sample Config (.aimap.yml)
```yaml
# Source directory for rule files
source: .rules

# Agents to build for
agents:
  - claude
  - cursor
  - copilot
  - windsurf
```

### Sample Rule File (.rules/01-coding-style.md)
```markdown
# Coding Style Guidelines

- Use TypeScript for all new code
- Follow ESLint configuration  
- Write comprehensive tests
- Use meaningful variable names
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

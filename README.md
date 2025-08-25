# aimap

A universal build tool for managing coding agent rules across multiple AI-powered development tools

## Installation

```bash
npm install -g aimap
```

Or use directly with npx (after publish):

```bash
npx aimap build
```

### Local (pre-publish) usage

When working in this repository before publish, use the local wrapper:

```bash
./aimap --help
./aimap build
./aimap clean
```

## Usage

### Build rules for all coding agents

```bash
aimap build
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

## Supported Coding Agents

### Core Agents
- **Claude Code** - Generates `CLAUDE.md` and `AGENTS.md` with `@` import syntax
- **Cline** - Copies rules to `.clinerules/` directory
- **RooCode** - Copies rules to `.roo/` directory  
- **Cursor** - Generates `.cursor/rules` and `.cursorrules` files
- **Windsurf** - Generates `.windsurf/rules` and `.windsurfrules` files
- **Codex** - Generates `CODEX.md` file

### Popular Agents (2025)
- **GitHub Copilot** - Generates `.github/copilot-instructions.md`
- **Amazon Q** - Copies rules to `.amazonq/rules/` directory
- **Continue.dev** - Generates `.continue/config.yaml` with rules array
- **Aider** - Generates `.aider.conf.yml` with read field and `.aider-rules/` directory
- **Tabnine** - Generates `.tabnine` configuration file
- **Replit AI** - Generates `replit.md` file

### Enterprise Agents
- **JetBrains AI Assistant** - Generates `.jbai/rules.md`
- **Sourcegraph Cody** - Generates `.cody.json` configuration
- **Google Gemini Code Assist** - Generates `.gemini/rules.yaml`
- **Pieces for Developers** - Generates `pieces.toml` configuration
- **Tabby ML** - Generates `tabby.yaml` for self-hosted instances
- **GitHub Copilot Workspace** - Generates `.workspace/rules.yaml` for workflows

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

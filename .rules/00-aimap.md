# aimapper Project Overview

aimapper (command: aimap) is a universal build tool for managing coding agent rules across multiple AI-powered development tools.

## Key Features

- Support for 12+ major AI coding agents
- Extensible plugin architecture
- Simple YAML configuration
- Cross-platform compatibility

## Supported Agents

- Claude, Cline, RooCode, Cursor, Windsurf, Codex
- GitHub Copilot, Amazon Q, Continue.dev
- Aider, Tabnine, Replit AI

## Usage

```bash
npx aimapper build     # Build for all agents (runs 'aimap build')
npx aimapper clean     # Clean generated files (runs 'aimap clean')
# or with global install:
aimap build
aimap clean
```

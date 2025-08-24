# aimap Project Context

## Overview

aimap is an AI-powered CLI tool for generating and visualizing interactive maps. It leverages AI to transform various data formats into visual, interactive map representations.

## Core Functionality

### Commands
- `generate`: Main command to create maps from input data
  - Supports multiple input formats (JSON, YAML, CSV)
  - Outputs interactive HTML maps or static images
  - AI-powered data interpretation and visualization

### Key Features
1. **Data Processing**: Parse and validate input data
2. **AI Integration**: Use LLMs to understand data context and suggest visualizations
3. **Map Generation**: Create interactive maps using mapping libraries
4. **Export Options**: Support various output formats

## Technical Architecture

### CLI Framework
- Built on oclif (Open CLI Framework)
- Modular command structure
- Plugin-based architecture for extensibility

### Dependencies
- `@oclif/core`: CLI framework
- `@inquirer/prompts`: Interactive prompts
- `yaml`: YAML parsing
- `execa`: Process execution

### Future Integrations (Planned)
- Map libraries: Leaflet, Mapbox, or D3.js
- AI services: OpenAI, Anthropic, or local models
- Data processing: GeoJSON, KML support
- Export formats: PNG, SVG, interactive HTML

## Development Environment
- Node.js 22.18.0 LTS
- TypeScript with ES2022 target
- Vitest for testing
- ESLint + Prettier for code quality
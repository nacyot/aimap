# aimap

AI-powered interactive map generation and visualization CLI

## Installation

```bash
npm install -g aimap
```

Or use directly with npx:

```bash
npx aimap generate data.json
```

## Usage

### Generate a map

```bash
aimap generate data.json
```

### Options

- `-f, --format <format>` - Input data format (json, yaml, csv) [default: json]
- `-o, --output <path>` - Output file path
- `-i, --interactive` - Enable interactive mode [default: true]

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
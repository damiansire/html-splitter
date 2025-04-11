# HTML Splitter

A tool for extracting CSS from HTML files and separating them into individual files.

## Project Structure

```
html-splitter/
├── src/                    # Source code
│   └── index.js           # Main CSS extraction script
├── tests/                 # Tests
│   ├── unit/             # Unit tests
│   └── integration/      # Integration tests
├── config/               # Configuration files
├── docs/                 # Documentation
├── public/               # Static files
├── package.json
└── README.md
```

## Installation

```bash
npm install
```

## Usage

To extract CSS from HTML files:

```bash
# Using npm script
npm run extract

# Or directly with node
node src/index.js [input_directory] [output_directory]
```

### Parameters

- `input_directory`: Directory containing HTML files (optional, default: current directory)
- `output_directory`: Directory where processed files will be saved (optional, default: ./output)

## Development

```bash
npm run dev
```

## Testing

```bash
npm test
```

## Features

- Extracts CSS from HTML files
- Creates separate CSS files
- Updates HTML files to reference external CSS
- Recursively processes directories
- Handles multiple HTML files
- Preserves original file structure 
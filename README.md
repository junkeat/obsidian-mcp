# second-brain-mcp

An MCP (Model Context Protocol) server, internally named **Second-Brain-Bridge**, that bridges an AI assistant to a local Obsidian-style markdown vault. It exposes tools for searching, reading, creating, and editing notes.

## Features

- **Search notes** — recursively find markdown notes in your vault by filename.
- **Read notes** — retrieve the full contents of a specific note.
- **Add notes** — create a new markdown note (fails if it already exists).
- **Edit notes** — create a new note or overwrite an existing one with new content.

## Requirements

- Node.js 18+
- npm

## Configuration

The notes tools operate on a vault directory controlled by an environment variable:

```bash
OBSIDIAN_VAULT_PATH=/path/to/your/vault
```

This variable is required — the server will fail to start if it is not set.

## Installation

```bash
npm install
```

## Build

```bash
npm run build
```

Compiles TypeScript from `src/` to `build/`, with `build/index.js` as the executable entry point.

## Testing

```bash
npm test
```

Builds the project and runs the unit tests using Node's built-in test runner.

## Usage

Register the server with an MCP-compatible client (e.g. Claude Desktop) by pointing it at `build/index.js`:

```json
{
  "mcpServers": {
    "second-brain": {
      "command": "node",
      "args": ["/path/to/second-brain-mcp/build/index.js"],
      "env": {
        "OBSIDIAN_VAULT_PATH": "/path/to/your/vault"
      }
    }
  }
}
```

**Note:** Claude Desktop only picks up server changes on a full restart — rebuilding the server does not hot-reload an active session.

## Available Tools

| Tool | Description |
|------|-------------|
| `search_notes` | Search local markdown notes by filename |
| `read_note` | Read the full contents of a specific markdown note |
| `edit_note` | Create a new note or overwrite an existing markdown note with new content |
| `add_note` | Add a new markdown note (fails if the file already exists) |

## Known Limitations

- `search_notes` matches only against filenames (not note content).

## Tech Stack

- TypeScript (strict mode, ES2022 target, Node16 modules)
- [`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- [`zod`](https://www.npmjs.com/package/zod) for schema validation

## License

ISC
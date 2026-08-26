# Weavetab Example Plugin

A template and reference implementation for developing plugins for the Weavetab ecosystem. This repository demonstrates how to extend Weavetab and register custom Model Context Protocol (MCP) tools using the Weavetab SDK.

## Overview

Weavetab plugins allow developers to inject custom tools, handle browser automation tasks, and integrate with external APIs seamlessly within the Weavetab platform.

This example plugin showcases:
- Implementation of the `WeavetabPlugin` interface and lifecycle hooks (`onLoad`, `onUnload`).
- Dynamic MCP tool registration with argument schemas.
- Plugin manifest declaration and permission scopes via `weavetab.json`.
- TypeScript build configuration optimized for Weavetab runtime environments.

## Project Structure

```text
.
├── src/
│   └── index.ts        # Plugin implementation and tool registration
├── package.json        # Dependencies and build scripts
├── tsconfig.json       # TypeScript compiler settings
├── weavetab.json       # Weavetab plugin manifest and permissions
└── README.md           # Project documentation
```

## Requirements

- Node.js: `>= 20.19.0`
- Weavetab Runtime: `>= 2.5.0`
- TypeScript: `^5.0.0`

## Getting Started

### 1. Installation

Install dependencies using your preferred package manager:

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 2. Development

Run the plugin in development mode with live reloading:

```bash
npm run dev
```

### 3. Build

Compile and bundle the plugin for production distribution:

```bash
npm run build
```

The compiled output will be generated in the `dist/` directory.

## Plugin Architecture

### Manifest (`weavetab.json`)

Every Weavetab plugin requires a `weavetab.json` manifest at its root. This file defines metadata, supported runtime environments, and required permissions:

```json
{
  "$schema": "https://weavetab.pages.dev/schema/plugin.json",
  "name": "weavetab-plugin-example",
  "version": "1.0.0",
  "description": "An enterprise template for building Weavetab plugins.",
  "engines": {
    "weavetab": "^2.5.0",
    "node": ">=20.19.0"
  },
  "environments": [
    "mcp"
  ],
  "permissions": [
    "browser.evaluate",
    "browser.navigate"
  ]
}
```

#### Permission Scopes

Declare only the permissions your plugin actively requires:
- `browser.evaluate`: Allows script evaluation within the browser context.
- `browser.navigate`: Allows triggering page navigation and tab management.

### Entry Point (`src/index.ts`)

The plugin entry point must export a default class implementing the `WeavetabPlugin` interface:

```typescript
import { WeavetabPlugin, PluginContext } from "@weavetab/sdk";

export default class ExamplePlugin implements WeavetabPlugin {
  name = "weavetab-plugin-example";

  async onLoad(ctx: PluginContext) {
    // Register custom MCP tools
    ctx.mcp.registerTool({
      name: "example_hello_world",
      description: "A sample tool injected by the example plugin",
      schema: {
        type: "object",
        properties: {
          name: { type: "string" }
        },
        required: ["name"]
      },
      handler: async (args) => {
        return {
          content: [
            {
              type: "text",
              text: `Hello ${args.name} from the Weavetab Plugin Ecosystem!`
            }
          ]
        };
      }
    });

    console.log("Example plugin loaded successfully.");
  }

  async onUnload(ctx: PluginContext) {
    // Perform cleanup when plugin is deactivated
    console.log("Example plugin unloaded.");
  }
}
```

## Adding Custom MCP Tools

To add new capabilities to your plugin:
1. Define a JSON Schema for your tool inputs under the `schema` property.
2. Implement the `handler` function to process arguments and return formatted MCP response content.
3. Ensure required permissions are specified in `weavetab.json`.

## License

MIT

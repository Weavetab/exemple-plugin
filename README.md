# WeaveTab Example Plugin (`weavetab-plugin-example`)

> Official reference plugin and starter template for developing custom Model Context Protocol (MCP) tools and plugins for the **[WeaveTab](https://github.com/Weavetab)** ecosystem.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Engine: WeaveTab ^2.5.0](https://img.shields.io/badge/engine-weavetab_%5E2.5.0-black.svg?style=flat-square)](https://github.com/weavetab/mcp)
[![TypeScript: 5.x](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg?style=flat-square)](https://www.typescriptlang.org/)

---

## ⚡ Overview

WeaveTab plugins extend the runtime capabilities of the WeaveTab MCP server. They allow developers and enterprise teams to:
- **Register Custom MCP Tools**: Expose new automation actions, internal API queries, or domain flows directly to AI coding agents (Claude, Antigravity, Cursor, Cline).
- **Access Isolated Sandboxed Storage**: Persist plugin-specific configuration and telemetry counters without polluting global server state.
- **Provide Visual Feedback**: Display thought bubbles and update the Browser HUD directly on the user's active Chromium tab.
- **Enforce Permission Scopes**: Explicitly declare CDP and system permissions via `weavetab.json`.

---

## 📁 Repository Structure

```text
weavetab-plugin-example/
├── src/
│   └── index.ts          # Plugin implementation, lifecycle hooks & tool registrations
├── dist/                 # Compiled JavaScript and TypeScript declarations (.d.ts)
├── package.json          # Package manifest and npm build scripts
├── tsconfig.json         # Strict TypeScript compiler options
├── weavetab.json         # WeaveTab plugin manifest & security permissions
└── README.md             # Developer guide and documentation
```

---

## 🚀 Getting Started

### 1. Requirements

- **Node.js**: `>= 20.19.0`
- **WeaveTab MCP**: `>= 2.5.0`
- **TypeScript**: `^5.0.0`

### 2. Installation & Setup

Clone this repository or use it as a GitHub template:

```bash
git clone https://github.com/Weavetab/exemple-plugin.git my-plugin
cd my-plugin
npm install
```

### 3. Compile the Plugin

Compile the TypeScript source into the distribution bundle:

```bash
npm run build
```

For continuous compilation during development:

```bash
npm run dev
```

---

## 🛠️ Plugin Architecture

### 1. Manifest Declaration (`weavetab.json`)

Every plugin requires a `weavetab.json` manifest at its root describing its identity and security permissions:

```json
{
  "$schema": "https://raw.githubusercontent.com/weavetab/sdk/main/schema/plugin.json",
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
  "permissions": {
    "cdp": {
      "evaluate": true,
      "navigate": true,
      "reason": "Allows the plugin to run custom in-page automations and navigate tabs."
    }
  }
}
```

### 2. Plugin Entry Point (`src/index.ts`)

The entry point exports a default class implementing the `WeavetabPlugin` interface:

```typescript
import { WeavetabPlugin, PluginContext } from "@weavetab/sdk";

export default class ExamplePlugin implements WeavetabPlugin {
  name = "weavetab-plugin-example";

  async onLoad(ctx: PluginContext): Promise<void> {
    // Register custom tool
    ctx.mcp.registerTool({
      name: "example_hello_world",
      description: "A sample tool injected by the example plugin",
      schema: {
        type: "object",
        properties: {
          name: { type: "string", description: "The name to greet" }
        },
        required: ["name"]
      },
      handler: async (args: { name: string }, session: any) => {
        // Sandboxed storage
        const runs = ((await ctx.storage.get<number>("runs", 0)) || 0) + 1;
        await ctx.storage.set("runs", runs);

        // Visual feedback on active tab
        if (ctx.extension && session) {
          await ctx.extension.showThought(
            session,
            `Greeting ${args.name} (run #${runs})`,
            { durationMs: 3000 }
          );
        }

        return {
          content: [
            {
              type: "text",
              text: `Hello, ${args.name}! (execution #${runs})`
            }
          ]
        };
      }
    });
  }

  async onUnload(ctx: PluginContext): Promise<void> {
    // Perform cleanup when plugin is deactivated
  }
}
```

---

## 🧪 Testing Your Plugin

Once compiled (`npm run build`), load the plugin into your running WeaveTab MCP session:

1. **Via MCP Tool**: Call `load_plugin` with the absolute path to your plugin directory.
2. **Via Configuration**: Add your plugin path to your local `~/.weavetab/plugins/` directory.

---

## 📄 License

MIT &copy; [WeaveTab Organization](https://github.com/Weavetab) & [fy2ne](https://github.com/fy2ne)

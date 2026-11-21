# `weavetab-plugin-example`

Reference plugin built with `@weavetab/sdk` (`weavetab init --template standard`) for [Weavetab](https://weavetab.dev).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![SDK: @weavetab/sdk ^2.6.4](https://img.shields.io/badge/sdk-%40weavetab%2Fsdk_%5E2.6.4-black.svg?style=flat-square)](https://weavetab.dev)
[![TypeScript: 5.x](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg?style=flat-square)](https://www.typescriptlang.org/)

## What this is

A minimal standard-template plugin. It registers one MCP tool (`example_hello_world`), persists a run counter in isolated storage, and optionally shows a HUD thought bubble when a browser session is active.

To start a new plugin, scaffold it with the SDK CLI:

```bash
npx -y @weavetab/sdk init my-plugin --template standard
cd my-plugin
npm install
npm run build
```

## Requirements

- Node.js `>= 20.19.0`
- `@weavetab/sdk` `^2.6.4`
- TypeScript `^5.3.0`

## Structure

```text
weavetab-plugin-example/
├── src/index.ts      # definePlugin({ name, onLoad, onUnload }) + registerTool
├── weavetab.json     # manifest ($schema, permissions with reasons, tools)
├── package.json      # weavetab build/dev/validate/doctor/release scripts
├── tsconfig.json     # strict ES2022 / NodeNext
├── test/             # node:test manifest + handler tests
└── dist/             # compiled output (generated)
```

## SDK commands

Run `weavetab help` to see all available commands:

```bash
npm run build      # weavetab build (tsc + sync weavetab.json)
npm run dev        # weavetab dev (watch mode)
npm run validate   # weavetab validate [--offline] (manifest + schema check)
npm run doctor     # weavetab doctor (env + schema + registry check)
npm run release    # weavetab-sdk publish [--dry-run] (npm publish + sync to weavetab.dev)
weavetab templates # list all 5 templates
```

## Templates

| Template | Command | Included |
|---|---|---|
| `standard` | `weavetab init x --template standard` | Tools, isolated storage, HUD feedback (this repo) |
| `visual` | `weavetab init x --template visual` | `highlight_elements` HUD/badge/style injector |
| `scraper` | `weavetab init x --template scraper` | `extract_table_data` DOM scraper + JSON storage |
| `automation` | `weavetab init x --template automation` | `run_automation` multi-step workflow |
| `override` | `weavetab init x --template override` | `overrideTool` + `beforeToolCall` interceptor |

Unknown `--template` values exit non-zero and print the template table.

## Manifest (`weavetab.json`)

Permissions are declared in `weavetab.json`, not in source code. Package metadata (`version`, `author`, `license`, `engines`) lives in `package.json`.

```json
{
  "$schema": "https://weavetab.dev/schema/plugin.json",
  "name": "weavetab-plugin-example",
  "displayName": "Example Plugin",
  "description": "Reference plugin demonstrating MCP tools, isolated storage, and HUD feedback.",
  "entry": "dist/index.js",
  "defaultConfig": {
    "enableHud": true
  },
  "permissions": {
    "config": { "read": true, "write": true, "reason": "Reads isolated plugin preferences (HUD toggle)." },
    "extension": { "hud": true, "reason": "Shows greeting thought bubble on the active tab." },
    "tools": { "add": true, "reason": "Registers the example_hello_world tool." }
  }
}
```

Schema: [weavetab.dev/schema/plugin.json](https://weavetab.dev/schema/plugin.json)

## Entry point (`src/index.ts`)

Default-export `definePlugin(...)`. `onLoad` receives `ctx` (`mcp`, `cli`, `storage`, `extension`, `config`, `hooks`, `logger`):

```typescript
import { definePlugin, defineTool, z, type PluginContext } from "@weavetab/sdk";

export default definePlugin({
  name: "weavetab-plugin-example",
  async onLoad(ctx: PluginContext) {
    ctx.mcp.registerTool(
      defineTool({
        name: "example_hello_world",
        description: "Greet a user or agent and increment a persistent run counter",
        schema: {
          name: z.string().describe("The name of the user or agent to greet"),
        },
        handler: async (args, session) => {
          const runs = ((await ctx.storage.get<number>("runs", 0)) || 0) + 1;
          await ctx.storage.set("runs", runs);
          if (ctx.config?.enableHud && ctx.extension && session) {
            await ctx.extension.showThought(session, `Greeting ${args.name} (execution #${runs})`, { durationMs: 3000 });
          }
          return { content: [{ type: "text", text: `Hello, ${args.name}! (execution #${runs})` }] };
        },
      })
    );
  },
});
```

Tool schemas use a Zod raw shape (`{ name: z.string() }`) so the runtime validates input and `weavetab build` exports JSON Schema into `weavetab.json`.

## Testing

```bash
npm test
```

## Loading into Weavetab

1. Run `npm run build`
2. Install into the runtime: `weavetab plugin add ./` (or `weavetab plugin add weavetab-plugin-example` once published)

## Publish

```bash
weavetab publish --dry-run
weavetab publish
```

## License

MIT © [Weavetab](https://github.com/Weavetab) & [fy2ne](https://github.com/fy2ne)

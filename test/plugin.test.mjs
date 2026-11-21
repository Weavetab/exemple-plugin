import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import plugin from "../dist/index.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, "weavetab.json"), "utf8"));
const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8"));

describe("weavetab-plugin-example", () => {
  it("has a valid weavetab.json manifest with manifest-only permissions", () => {
    assert.equal(manifest.$schema, "https://weavetab.dev/schema/plugin.json");
    assert.equal(manifest.name, pkg.name);
    assert.equal(manifest.entry, "dist/index.js");
    assert.ok(fs.existsSync(path.join(rootDir, manifest.entry)));
    assert.equal(plugin.permissions, undefined, "permissions belong in weavetab.json, not source code");

    assert.equal(manifest.permissions?.tools?.add, true);
    for (const [scope, cfg] of Object.entries(manifest.permissions || {})) {
      assert.ok(typeof cfg?.reason === "string" && cfg.reason.trim().length > 0, `missing reason for permissions.${scope}`);
    }
  });

  it("exports valid plugin definition", () => {
    assert.equal(plugin.name, "weavetab-plugin-example");
    assert.equal(plugin.version, "1.0.0");
    assert.ok(plugin.instructions);
    assert.equal(typeof plugin.onLoad, "function");
    assert.equal(typeof plugin.onUnload, "function");
  });

  it("registers example_hello_world and persists run count", async () => {
    let tool = null;
    const store = new Map();

    const ctx = {
      mcp: {
        registerTool: (t) => {
          tool = t;
        },
      },
      storage: {
        get: async (key, fallback) => store.get(key) ?? fallback,
        set: async (key, val) => {
          store.set(key, val);
        },
      },
      config: {
        enableHud: false,
      },
      logger: {
        info: () => {},
      },
    };

    await plugin.onLoad(ctx);

    assert.ok(tool, "tool must be registered during onLoad");
    assert.equal(tool.name, "example_hello_world");
    assert.equal(typeof tool.schema.name.parse, "function");
    assert.ok(manifest.tools.some((t) => t.name === tool.name), "manifest.tools must list registered tool");

    const first = await tool.handler({ name: "Operator" });
    assert.equal(first.content[0].type, "text");
    assert.match(first.content[0].text, /Hello, Operator! \(execution #1\)/);

    const second = await tool.handler({ name: "Operator" });
    assert.match(second.content[0].text, /Hello, Operator! \(execution #2\)/);
    assert.equal(await ctx.storage.get("runs"), 2);
  });
});

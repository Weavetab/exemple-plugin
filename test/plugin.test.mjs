import { describe, it } from "node:test";
import assert from "node:assert/strict";
import plugin from "../dist/index.js";

describe("weavetab-plugin-example test suite", () => {
  it("exports valid WeaveTab plugin definition", () => {
    assert.equal(plugin.name, "weavetab-plugin-example");
    assert.equal(plugin.version, "1.0.0");
    assert.equal(typeof plugin.onLoad, "function");
    assert.equal(typeof plugin.onUnload, "function");
  });

  it("registers tool and executes handler correctly", async () => {
    let registeredTool = null;
    const storageStore = new Map();

    const mockCtx = {
      mcp: {
        registerTool: (tool) => {
          registeredTool = tool;
        },
      },
      storage: {
        get: async (key, fallback) => storageStore.get(key) ?? fallback,
        set: async (key, val) => {
          storageStore.set(key, val);
        },
      },
      config: {
        enableHud: false,
      },
      logger: {
        info: () => {},
      },
    };

    await plugin.onLoad(mockCtx);

    assert.ok(registeredTool, "Tool must be registered during onLoad");
    assert.equal(registeredTool.name, "example_hello_world");
    assert.equal(registeredTool.schema.type, "object");

    const result = await registeredTool.handler({ name: "Operator" });
    assert.ok(result.content);
    assert.equal(result.content[0].type, "text");
    assert.match(result.content[0].text, /Hello, Operator!/);

    // Verify storage persistence
    const runs = await mockCtx.storage.get("runs");
    assert.equal(runs, 1);
  });
});

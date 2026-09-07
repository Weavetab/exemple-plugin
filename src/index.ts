import { definePlugin, type PluginContext } from "@weavetab/sdk";

export default definePlugin({
  name: "weavetab-plugin-example",
  version: "1.0.0",
  description: "An enterprise template for building Weavetab plugins.",
  defaultConfig: {
    enableHud: true,
  },

  async onLoad(ctx: PluginContext): Promise<void> {
    // 1. Register a custom MCP tool dynamically
    ctx.mcp.registerTool({
      name: "example_hello_world",
      description: "A sample tool injected by the example plugin demonstrating MCP tool registration",
      schema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name of the user or agent to greet",
          },
        },
        required: ["name"],
      },
      handler: async (args: { name: string }, session: any) => {
        // Track execution count in isolated plugin storage
        const executions = ((await ctx.storage.get<number>("runs", 0)) || 0) + 1;
        await ctx.storage.set("runs", executions);

        // Optional: show visual feedback if running with HUD/extension
        if (ctx.config?.enableHud && ctx.extension && session) {
          await ctx.extension.showThought(
            session,
            `Greeting ${args.name} (execution #${executions})`,
            { durationMs: 3000 }
          );
        }

        return {
          content: [
            {
              type: "text",
              text: `Hello, ${args.name}! Greetings from the WeaveTab Plugin Ecosystem (execution #${executions}).`,
            },
          ],
        };
      },
    });

    ctx.logger?.info("weavetab-plugin-example loaded successfully.");
  },

  async onUnload(ctx: PluginContext): Promise<void> {
    ctx.logger?.info("weavetab-plugin-example unloaded.");
  },
});
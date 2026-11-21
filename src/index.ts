import { definePlugin, defineTool, z, type PluginContext } from "@weavetab/sdk";

export default definePlugin({
  name: "weavetab-plugin-example",
  version: "1.0.0",
  description: "Reference plugin demonstrating MCP tools, isolated storage, and HUD feedback.",
  instructions: "Reference plugin demonstrating MCP tools, isolated storage, and HUD feedback. Use example_hello_world with name parameter to greet and track run counts.",
  defaultConfig: {
    enableHud: true,
  },

  async onLoad(ctx: PluginContext): Promise<void> {
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
            await ctx.extension.showThought(
              session,
              `Greeting ${args.name} (execution #${runs})`,
              { durationMs: 3000 }
            );
          }

          return {
            content: [
              {
                type: "text",
                text: `Hello, ${args.name}! (execution #${runs})`,
              },
            ],
          };
        },
      })
    );

    ctx.logger?.info("example plugin loaded");
  },

  async onUnload(ctx: PluginContext): Promise<void> {
    ctx.logger?.info("example plugin unloaded");
  },
});

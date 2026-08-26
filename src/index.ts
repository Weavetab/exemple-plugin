import { WeavetabPlugin, PluginContext } from "@weavetab/sdk";

export default class ExamplePlugin implements WeavetabPlugin {
    name = "weavetab-plugin-example";

    async onLoad(ctx: PluginContext) {
        // Register a tool dynamically with the MCP server
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
                    content: [{ type: "text", text: `Hello ${args.name} from the Weavetab Plugin Ecosystem!` }]
                };
            }
        });

        console.log("Example plugin loaded successfully!");
    }

    async onUnload(ctx: PluginContext) {
        // Cleanup if needed
        console.log("Example plugin unloaded.");
    }
}
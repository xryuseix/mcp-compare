#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import { randomUUID } from "crypto";

const app = express();
const PORT = 3001;

app.use(express.json());

const server = new Server(
  {
    name: "ping-server-http",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "ping",
        description: "Returns 'pong {name}' for the given name",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name to echo back in the pong response",
            },
          },
          required: ["name"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "ping") {
    const name = request.params.arguments?.name as string;
    return {
      content: [
        {
          type: "text",
          text: `pong ${name}`,
        },
      ],
    };
  }
  
  throw new Error(`Unknown tool: ${request.params.name}`);
});

async function main() {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });

  await server.connect(transport);

  // Handle all requests at /mcp endpoint
  app.all("/mcp", async (req, res) => {
    await transport.handleRequest(req, res, req.body);
  });

  app.listen(PORT, () => {
    console.log(`Ping MCP Server (Streamable HTTP) running on http://localhost:${PORT}/mcp`);
  });
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

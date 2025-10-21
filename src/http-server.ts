#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  JSONRPCRequest,
} from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);
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

// MCP over HTTP endpoint
app.post("/mcp", async (req, res) => {
  try {
    const request = req.body as JSONRPCRequest;
    const response = await server.request(request, CallToolRequestSchema);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

httpServer.listen(PORT, () => {
  console.log(`Ping MCP Server (HTTP) running on http://localhost:${PORT}/mcp`);
});

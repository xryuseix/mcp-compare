#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  JSONRPCRequest,
} from "@modelcontextprotocol/sdk/types.js";
import express, { Request, Response } from "express";

const app = express();
const PORT = 3002;

app.use(express.json());

const server = new Server(
  {
    name: "ping-server-sse",
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

// SSE endpoint
app.get("/mcp/sse", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write("data: connected\n\n");

  req.on("close", () => {
    res.end();
  });
});

// Handle MCP requests via POST
app.post("/mcp/sse", async (req: Request, res: Response) => {
  try {
    const request = req.body as JSONRPCRequest;
    const response = await server.request(request, CallToolRequestSchema);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.listen(PORT, () => {
  console.log(`Ping MCP Server (SSE) running on http://localhost:${PORT}/mcp/sse`);
});

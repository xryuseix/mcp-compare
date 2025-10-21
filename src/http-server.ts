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

// Store server and transport pairs by session ID
const sessions = new Map();

function createServerAndTransport() {
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

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: async (sessionId) => {
      console.error(`New session initialized: ${sessionId}`);
      // Store this session
      sessions.set(sessionId, { server, transport });
    },
    onsessionclosed: async (sessionId) => {
      console.error(`Session closed: ${sessionId}`);
      sessions.delete(sessionId);
    },
  });

  return { server, transport };
}

// Handle all requests at /mcp endpoint
app.all("/mcp", async (req, res) => {
  // Try to extract session ID from request
  const sessionId = req.headers['mcp-session-id'] as string;
  
  let sessionData = sessionId ? sessions.get(sessionId) : null;
  
  if (!sessionData) {
    // Create new session
    sessionData = createServerAndTransport();
    await sessionData.server.connect(sessionData.transport);
  }
  
  await sessionData.transport.handleRequest(req, res, req.body);
});

app.listen(PORT, () => {
  console.log(`Ping MCP Server (Streamable HTTP) running on http://localhost:${PORT}/mcp`);
});

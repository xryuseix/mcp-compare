#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express, { Request, Response } from "express";
import { randomUUID } from "crypto";

const app = express();
const PORT = 3002;

app.use(express.json());

// Store active transports by session ID
const transports = new Map<string, SSEServerTransport>();

// SSE endpoint - GET request establishes the SSE stream
app.get("/mcp/sse", async (req: Request, res: Response) => {
  const sessionId = randomUUID();
  
  console.error(`SSE connection request for session ${sessionId}`);
  
  // Create a new server instance for each connection
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
  
  // Create SSE transport - the endpoint should be relative path only
  const transport = new SSEServerTransport(`/message`, res);
  
  transports.set(sessionId, transport);
  
  transport.onclose = () => {
    transports.delete(sessionId);
    console.error(`SSE connection closed for session ${sessionId}`);
  };
  
  transport.onerror = (error) => {
    console.error(`SSE transport error for session ${sessionId}:`, error);
  };
  
  // Connect server to this transport
  // NOTE: connect() automatically calls start(), so don't call start() manually!
  await server.connect(transport);
  
  console.error(`SSE connection established for session ${sessionId}, transport sessionId: ${transport.sessionId}`);
});

// POST endpoint - receives messages from client
// The client will POST to /message with the session ID in the URL or body
app.post("/message", async (req: Request, res: Response) => {
  console.error(`Received POST to /message, body:`, JSON.stringify(req.body).substring(0, 200));
  
  // Try to find the transport by checking all transports
  // The session ID should be in the request somehow
  let foundTransport: SSEServerTransport | undefined;
  
  for (const [sessionId, transport] of transports.entries()) {
    // Check if this transport's sessionId matches
    if (req.body?.sessionId === transport.sessionId || 
        req.query?.sessionId === transport.sessionId ||
        req.headers['x-session-id'] === transport.sessionId) {
      foundTransport = transport;
      console.error(`Found transport for sessionId ${transport.sessionId}`);
      break;
    }
  }
  
  if (!foundTransport && transports.size === 1) {
    // If there's only one connection, use it
    foundTransport = Array.from(transports.values())[0];
    console.error(`Using single available transport`);
  }
  
  if (!foundTransport) {
    console.error(`No transport found. Active transports: ${transports.size}`);
    res.status(404).json({ error: "Session not found" });
    return;
  }
  
  await foundTransport.handlePostMessage(req, res, req.body);
});

app.listen(PORT, () => {
  console.log(`Ping MCP Server (SSE) running on http://localhost:${PORT}/mcp/sse`);
});

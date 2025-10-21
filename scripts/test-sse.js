#!/usr/bin/env node

import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

const SERVER_URL = "http://localhost:3002/mcp/sse";

async function testSSE() {
  console.log("Testing SSE MCP Server...\n");

  // Create SSE client transport
  const transport = new SSEClientTransport(new URL(SERVER_URL));
  
  // Create MCP client
  const client = new Client(
    {
      name: "test-sse-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  try {
    // Connect to server
    console.log("1. Connecting to SSE server...");
    await client.connect(transport);
    console.log("   ✓ Connected\n");

    // List tools
    console.log("2. Listing tools...");
    const tools = await client.listTools();
    console.log("   Tools:", JSON.stringify(tools, null, 2));
    console.log("");

    // Call ping tool
    console.log("3. Calling ping tool with name='world'...");
    const result = await client.callTool({
      name: "ping",
      arguments: {
        name: "world",
      },
    });
    console.log("   Result:", JSON.stringify(result, null, 2));
    console.log("");

    // Call ping tool with different name
    console.log("4. Calling ping tool with name='SSE test'...");
    const result2 = await client.callTool({
      name: "ping",
      arguments: {
        name: "SSE test",
      },
    });
    console.log("   Result:", JSON.stringify(result2, null, 2));
    console.log("");

    console.log("✓ All tests passed!");

  } catch (error) {
    console.error("✗ Error:", error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

testSSE();

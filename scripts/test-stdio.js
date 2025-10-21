#!/usr/bin/env node

import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

async function testStdio() {
  console.log("Testing stdio MCP Server...\n");

  // Create stdio client transport
  const transport = new StdioClientTransport({
    command: "node",
    args: ["dist/stdio-server.js"],
  });
  
  // Create MCP client
  const client = new Client(
    {
      name: "test-stdio-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  try {
    // Connect to server
    console.log("1. Connecting to stdio server...");
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
    console.log("4. Calling ping tool with name='stdio test'...");
    const result2 = await client.callTool({
      name: "ping",
      arguments: {
        name: "stdio test",
      },
    });
    console.log("   Result:", JSON.stringify(result2, null, 2));
    console.log("");

    console.log("✓ All tests passed!");

  } catch (error) {
    console.error("✗ Error:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

testStdio();

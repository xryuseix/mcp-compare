#!/usr/bin/env node

import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { ProxyAgent } from "undici";

const SERVER_URL = "http://localhost:3001/mcp";
const PROXY_URL = "http://127.0.0.1:8080";
const USE_PROXY = true;

async function testHTTP() {
  console.log("Testing HTTP MCP Server...\n");

  if (USE_PROXY) {
    console.log(`Using proxy: ${PROXY_URL}\n`);
  }

  // Create Streamable HTTP client transport with optional proxy
  let transportOptions;
  
  if (USE_PROXY) {
    const proxyAgent = new ProxyAgent(PROXY_URL);
    // Custom fetch function that uses undici's ProxyAgent
    const customFetch = (url, init) => {
      console.log(`Fetching via proxy: ${url}`);
      return fetch(url, {
        ...init,
        dispatcher: proxyAgent,
      });
    };
    
    transportOptions = {
      fetch: customFetch,
    };
  }
  
  const transport = new StreamableHTTPClientTransport(
    new URL(SERVER_URL),
    transportOptions
  );
  
  // Create MCP client
  const client = new Client(
    {
      name: "test-http-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  try {
    // Connect to server
    console.log("1. Connecting to HTTP server...");
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
    console.log("✓ All tests passed!");

  } catch (error) {
    console.error("✗ Error:", error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

testHTTP();

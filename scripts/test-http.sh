#!/bin/bash

echo "Testing HTTP MCP Server..."
echo ""

# List tools
echo "1. List tools:"
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }' | jq .

echo ""
echo "2. Call ping tool:"
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "ping",
      "arguments": {
        "name": "world"
      }
    }
  }' | jq .

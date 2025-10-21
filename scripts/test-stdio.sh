#!/bin/bash

echo "Testing stdio MCP Server..."
echo ""

# List tools
echo "1. List tools:"
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/stdio-server.js 2>/dev/null | grep -v "^Ping MCP Server" | jq .

echo ""
echo "2. Call ping tool:"
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"ping","arguments":{"name":"world"}}}' | node dist/stdio-server.js 2>/dev/null | grep -v "^Ping MCP Server" | jq .

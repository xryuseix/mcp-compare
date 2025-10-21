# MCP Ping Server

3種類の通信方式でpingツールを提供するMCPサーバー

## Setup

```bash
npm install
npm run build
```

## Run

```bash
npm run stdio  # stdio
npm run http   # http (port 3001)
npm run sse    # sse (port 3002)
```

## Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/stdio-server.js
npx @modelcontextprotocol/inspector node dist/http-server.js
npx @modelcontextprotocol/inspector node dist/sse-server.js
```

## Test with curl/stdio

```bash
./scripts/test-stdio.sh  # stdio server
./scripts/test-http.sh   # HTTP server
./scripts/test-sse.sh    # SSE server
```

## Tool

- `ping(name: string)` → `"pong {name}"`

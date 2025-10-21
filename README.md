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
npm run http   # streamable HTTP (port 3001)
npm run sse    # SSE (port 3002)
```

## Test with MCP Inspector

### stdio
```bash
npx @modelcontextprotocol/inspector node dist/stdio-server.js
```

### HTTP
```bash
npx @modelcontextprotocol/inspector
node dist/http-server.js
```

### SSE
```bash
npx @modelcontextprotocol/inspector
node dist/sse-server.js
```

## Test with node

```bash
yarn test:stdio  # stdio server
yarn test:http   # HTTP server
yarn test:sse    # SSE server
```

## Tool

- `ping(name: string)` → `"pong ${name}"`

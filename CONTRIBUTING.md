# Contributing to mcp-enterprise-data-server
Want to contribute? Great!

All contributions are more than welcome ! This includes bug reports, bug fixes, enhancements, features, questions, ideas, and documentation.

This document will hopefully help you contribute to  mcp-enterprise-data-server.

 
## Getting the code
```bash
git clone git@github.com:yourname/mcp-enterprise-data-server.git

cd ArgusCapture

git remote add upstream https://github.com/shivarm/mcp-enterprise-data-server.git

npm install
 
```

## Building and running
```bash
npm run build   # tsc -> dist/
npm start       # node dist/index.js

By default the server listens on http://127.0.0.1:3000/mcp. You can override this with environment variables:

Variable	Default	Purpose
PORT	3000	TCP port to listen on
HOST	127.0.0.1	Bind address. Keep this at 127.0.0.1 for local dev.
ALLOWED_HOSTS	(none)	Comma-separated hostnames allowed past DNS-rebinding checks. Only needed if you set HOST=0.0.0.0.
```

For active development, run `npm run dev` in one terminal (tsc --watch, recompiles on save) and `npm run start` in another to pick up changes.

## Testing your changes

Every change should be verified against a running server using one or both of the methods below.

## 1. MCP Inspector (fastest, no other apps required)

With the server running (npm start), in another terminal:

```bash
# List every tool and its schema
npx @modelcontextprotocol/inspector --cli --server-url http://127.0.0.1:3000/mcp --method tools/list

# Call a specific tool
npx @modelcontextprotocol/inspector --cli --server-url http://127.0.0.1:3000/mcp \
  --method tools/call --tool-name get_company_overview

# Call a tool with arguments
npx @modelcontextprotocol/inspector --cli --server-url http://127.0.0.1:3000/mcp \
  --method tools/call --tool-name search_customers --tool-arg query=retail

# List resources
npx @modelcontextprotocol/inspector --cli --server-url http://127.0.0.1:3000/mcp --method resources/list
```

## 2. Claude Desktop (real-world client test)

Claude Desktop's built-in "Add custom connector" UI connects from Anthropic's cloud, so it can't reach a server on localhost. To test against a real client locally, bridge it with mcp-remote instead:

Start the server: npm start
Edit Claude Desktop's config file:
macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
Windows: %APPDATA%\Claude\claude_desktop_config.json

```json
json
   {
     "mcpServers": {
       "enterprise-data-server": {
         "command": "npx",
         "args": ["-y", "mcp-remote", "http://127.0.0.1:3000/mcp", "--allow-http"]
       }
     }
   }
```
Fully quit Claude Desktop (system tray on Windows, not just the window) and reopen it.
In a new chat, click the + button in the message box → Connectors and confirm `enterprise-data-server` is listed and toggled on.
Prompt Claude with something that needs your data, e.g. "What's our current account overview?" or "Search customers for retail."

## Thanks
 
 # mcp-enterprise-data-server

<p align="center">
  <img src="docs/logo.svg" alt="MCP Enterprise Data Server Logo" width="200">
</p>

<p align="center">
  <b>An enterprise-grade Model Context Protocol (MCP) server designed for scalable data integration and secure context streaming.</b>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#prerequisites">Prerequisites</a> •
</p>

---

## Features

- **Model Context Protocol Support:** Built-in integration with `@modelcontextprotocol/server` for context-aware AI tooling.
- **High Performance:** Optimized for handling enterprise-scale data workloads efficiently.
- **Type Safety & Validation:** End-to-end TypeScript support powered by `zod` schema validation.

---

## Prerequisites

Ensure you have the following installed on your system:

- **Node.js**: `v24.x` or higher
- **npm**: `v11.x` or higher

---

## Quick Start

```shell
# Install dependencies
npm install

# Build TypeScript output
npm run build

# Start server (Listens on http://127.0.0.1:3000/mcp)
npm run start
```

## Testing (CLI Mode)

```shell
# List all registered tools
npx @modelcontextprotocol/inspector --cli --server-url http://127.0.0.1:3000/mcp --method tools/list

# Test searching customer records
npx @modelcontextprotocol/inspector --cli --server-url http://127.0.0.1:3000/mcp --method tools/call --tool-name search_customers --tool-arg query=retail

# Test retrieving customer details
npx @modelcontextprotocol/inspector --cli --server-url http://127.0.0.1:3000/mcp --method tools/call --tool-name get_customer_detail --tool-arg customerId=CUST-1002
```

## Contributing

Contributions to **mcp-enterprise-data-server** are managed on [GitHub.com](CONTRIBUTING.md)

* [Raise an issue](https://github.com/shivarm/mcp-enterprise-data-server/issues)
* [Feature request](https://github.com/shivarm/mcp-enterprise-data-server/issues)
* [Code submission](https://github.com/shivarm/mcp-enterprise-data-server/pulls)

Contributions are most welcome !

Consider giving the project a [star](https://github.com/shivarm/mcp-enterprise-data-server/stargazers) on
[GitHub](https://github.com/shivarm/mcp-enterprise-data-server/) if you find it useful.


## License

[GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html)

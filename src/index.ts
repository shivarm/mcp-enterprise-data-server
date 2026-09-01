/**
 * mcp-enterprise-data-server
 * Copyright (C) 2026 Shivam Sharma
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
import { randomUUID } from "node:crypto";
import { createMcpExpressApp } from "@modelcontextprotocol/express";
import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node";
import { McpServer } from "@modelcontextprotocol/server";
import { pinoHttp } from "pino-http";
import { registerResources } from "./resources/enterpriseResources.js";
import { registerTools } from "./tools/enterpriseTools.js";
import { logger } from "./utils/logger.js";
import { SessionManager } from "./utils/sessionManager.js";
import isInitializeRequest from "./utils/utils.js";

function buildServer(): McpServer {
  const server = new McpServer({
    name: "mcp-enterprise-data-server",
    version: "1.0.0",
  });

  registerResources(server);
  registerTools(server);

  return server;
}

/**
 * Streamable HTTP transport
 */
async function main(): Promise<void> {
  const port = Number(process.env.PORT ?? 3000);
  // Default stays on 127.0.0.1 so createMcpExpressApp's DNS-rebinding
  // protection is on automatically. To accept traffic from other machines,
  // set HOST=0.0.0.0 and ALLOWED_HOSTS to every hostname clients will use.
  const host = process.env.HOST ?? "127.0.0.1";
  const allowedHosts = process.env.ALLOWED_HOSTS?.split(",").map((h) =>
    h.trim(),
  );

  const transports = new Map<string, NodeStreamableHTTPServerTransport>();

  const sessionManager = new SessionManager();
  sessionManager.startCleanupTask();

  const app = createMcpExpressApp({
    host,
    ...(allowedHosts ? { allowedHosts } : {}),
  });

  app.use(pinoHttp({ logger }));

  app.get("/", (req, res) => res.status(200).send("ok"));

  // GET /mcp — Handles initial SSE connection stream
  app.get("/mcp", async (req, res, next) => {
    try {
      const rawSessionId = req.headers["mcp-session-id"];
      const sessionId = Array.isArray(rawSessionId)
        ? rawSessionId[0]
        : rawSessionId;

      const session = sessionId
        ? sessionManager.getSession(sessionId)
        : undefined;

      if (!session) {
        return res.status(400).json({
          error:
            "Missing or invalid 'mcp-session-id' header. Initialize a session with POST /mcp first.",
        });
      }

      await session.transport.handleRequest(req, res, req.body);
    } catch (err) {
      next(err);
    }
  });

  // POST /mcp — Handles incoming JSON-RPC requests
  app.post("/mcp", async (req, res, next) => {
    try {
      const rawSessionId = req.headers["mcp-session-id"];
      const sessionId = Array.isArray(rawSessionId)
        ? rawSessionId[0]
        : rawSessionId;

      let session = sessionId
        ? sessionManager.getSession(sessionId)
        : undefined;

      if (!session) {
        if (sessionId) {
          return res.status(404).json({
            error:
              "Session not found or expired. Start a new session with an 'initialize' request.",
          });
        }

        if (!isInitializeRequest(req.body)) {
          return res.status(400).json({
            error: "No active session. Send an 'initialize' request first.",
          });
        }

        const transport = new NodeStreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (id) => {
            logger.info({ sessionId: id }, "MCP Session initialized");
            sessionManager.registerSession(id, transport);
          },
          onsessionclosed: (id) => {
            logger.info({ sessionId: id }, "MCP Session closed");
            sessionManager.removeSession(id);
          },
        });

        const server = buildServer();
        await server.connect(transport);

        session = { transport, lastActivity: Date.now() };
      }

      await session.transport.handleRequest(req, res, req.body);
    } catch (err) {
      next(err);
    }
  });

  // Reject all unsupported HTTP verbs (PUT, DELETE, PATCH, etc.)
  app.use("/mcp", (req, res) => {
    logger.warn({ method: req.method }, "Method not allowed on /mcp");
    res.setHeader("Allow", "GET, POST");
    res.status(405).json({
      error: `Method ${req.method} Not Allowed on /mcp. Use GET or POST.`,
    });
  });

  const httpServer = app.listen(port, host, () => {
    logger.info(
      `MCP Enterprise Data Server listening at http://${host}:${port}/mcp`,
    );
  });

  process.on("SIGINT", async () => {
    await sessionManager.stopAll();
    httpServer.close();
    logger.info("Shutting down MCP server gracefully...");
    for (const [id, transport] of transports) {
      await transport.close();
      transports.delete(id);
    }
    logger.info("Server closed successfully.");
    process.exit(0);
  });
}

main().catch((error) => {
  logger.fatal({ err: error }, "Fatal startup error");
  process.exit(1);
});

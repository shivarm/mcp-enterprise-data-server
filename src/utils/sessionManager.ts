import type { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node";
import { logger } from "./logger.js";

export interface SessionEntry {
  transport: NodeStreamableHTTPServerTransport;
  lastActivity: number;
}

export class SessionManager {
  private transports = new Map<string, SessionEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly timeoutMs: number = 30 * 60 * 1000,
    private readonly sweepIntervalMs: number = 5 * 60 * 1000,
  ) {}

  /**
   * Starts the background cleanup sweep
   */
  public startCleanupTask(): void {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(() => {
      this.sweepIdleSessions();
    }, this.sweepIntervalMs);

    // Prevent background timer from blocking process exit
    this.cleanupInterval.unref();
  }

  /**
   * Registers a new initialized session
   */
  public registerSession(
    sessionId: string,
    transport: NodeStreamableHTTPServerTransport,
  ): void {
    this.transports.set(sessionId, {
      transport,
      lastActivity: Date.now(),
    });
  }

  /**
   * Retrieves an active session and updates its last activity timestamp
   */
  public getSession(sessionId: string): SessionEntry | undefined {
    const session = this.transports.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
    }
    return session;
  }

  /**
   * Removes a session manually on clean close
   */
  public removeSession(sessionId: string): void {
    this.transports.delete(sessionId);
  }

  /**
   * Closes and clears all active sessions on server shutdown
   */
  public async stopAll(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    for (const [id, session] of this.transports.entries()) {
      try {
        await session.transport.close();
      } catch (err) {
        logger.error(
          { err, sessionId: id },
          "Error closing session during shutdown",
        );
      }
    }
    this.transports.clear();
  }

  /**
   * Sweeps and terminates inactive sessions
   */
  private async sweepIdleSessions(): Promise<void> {
    const now = Date.now();
    for (const [id, session] of this.transports.entries()) {
      if (now - session.lastActivity > this.timeoutMs) {
        logger.info(
          { sessionId: id, idleTimeMs: now - session.lastActivity },
          "Cleaning up inactive MCP transport session",
        );
        try {
          await session.transport.close();
        } catch (err) {
          logger.error({ err, sessionId: id }, "Error closing idle transport");
        } finally {
          this.transports.delete(id);
        }
      }
    }
  }
}

export default function isInitializeRequest(body: unknown): boolean {
  const messages = Array.isArray(body) ? body : [body];
  return messages.some(
    (msg) =>
      !!msg &&
      typeof msg === "object" &&
      (msg as { method?: unknown }).method === "initialize",
  );
}

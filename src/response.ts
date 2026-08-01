const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-HA-Webhook-Token"
};

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS
    }
  });
}

export function optionsResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

export function methodNotAllowed(): Response {
  return jsonResponse({ error: "Method not allowed" }, 405);
}

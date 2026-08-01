import {
  parseIngestPayload,
  readEnergy,
  readLastNonZeroUsage,
  storeEnergy,
  validateToken
} from "./ha";
import { jsonResponse, methodNotAllowed, optionsResponse } from "./response";
import { renderDashboard } from "./dashboard";
import { SERVICE_NAME, type Env } from "./types";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return optionsResponse();
    }

    const url = new URL(request.url);

    if (url.pathname === "/") {
      if (request.method !== "GET") return methodNotAllowed();
      return renderDashboard();
    }

    if (url.pathname === "/health") {
      if (request.method !== "GET") return methodNotAllowed();
      return jsonResponse({ status: "ok", service: SERVICE_NAME });
    }

    if (url.pathname === "/energy") {
      if (request.method !== "GET") return methodNotAllowed();

      const record = await readEnergy(env);

      if (!record) {
        return jsonResponse(
          { error: "No data yet. Waiting for Home Assistant push." },
          503
        );
      }

      const responseRecord = { ...record };
      if (Number(responseRecord.energy) <= 0 && !responseRecord.lastMonthUsage) {
        const fallbackUsage = await readLastNonZeroUsage(env);
        if (fallbackUsage) {
          responseRecord.lastMonthUsage = fallbackUsage;
        }
      }

      return jsonResponse(responseRecord);
    }

    if (url.pathname === "/ingest") {
      if (request.method !== "POST") return methodNotAllowed();

      if (!validateToken(request, env)) {
        console.warn("ingest_unauthorized", { ip: request.headers.get("cf-connecting-ip") });
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      try {
        const payload = await parseIngestPayload(request);
        const record = await storeEnergy(env, payload);
        console.log("ingest_ok", { energy: record.energy, updated: record.updated });
        return jsonResponse({ ok: true, stored: record });
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown error";
        console.error("ingest_failed", { message });
        return jsonResponse({ error: `Bad Request: ${message}` }, 400);
      }
    }

    return jsonResponse({ error: "Not Found" }, 404);
  }
} satisfies ExportedHandler<Env>;


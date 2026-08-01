import {
  ENTITY_ID,
  KV_KEY,
  KV_LAST_NON_ZERO_KEY,
  POWER_ENTITY_ID,
  type Env,
  type EnergyRecord,
  type IngestPayload,
  type LastMonthUsage
} from "./types";

export async function readEnergy(env: Env): Promise<EnergyRecord | null> {
  const raw = await env.ENERGY_KV.get(KV_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as EnergyRecord;
  } catch {
    return null;
  }
}

export function validateToken(request: Request, env: Env): boolean {
  const header = request.headers.get("X-HA-Webhook-Token");
  return header !== null && header === env.HA_WEBHOOK_TOKEN;
}

export async function parseIngestPayload(request: Request): Promise<IngestPayload> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new Error("Invalid JSON body");
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("entity" in body) ||
    !("state" in body)
  ) {
    throw new Error("Missing required fields: entity, state");
  }

  const payload = body as Record<string, unknown>;

  if (payload.entity !== ENTITY_ID) {
    throw new Error(`Unexpected entity: ${String(payload.entity)}`);
  }

  return {
    entity: String(payload.entity),
    state: String(payload.state),
    unit: payload.unit !== undefined ? String(payload.unit) : "kWh",
    updated: payload.updated !== undefined ? String(payload.updated) : new Date().toISOString(),
    powerKw: payload.powerKw !== undefined ? String(payload.powerKw) : undefined
  };
}

function toLastMonthUsage(candidate: EnergyRecord | null): LastMonthUsage | undefined {
  if (!candidate) {
    return undefined;
  }

  if (!Number.isFinite(candidate.energy) || candidate.energy <= 0) {
    return undefined;
  }

  return {
    energy: candidate.energy,
    unit: candidate.unit,
    updated: candidate.updated
  };
}

export async function readLastNonZeroUsage(env: Env): Promise<LastMonthUsage | undefined> {
  const raw = await env.ENERGY_KV.get(KV_LAST_NON_ZERO_KEY);
  if (!raw) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(raw) as LastMonthUsage;
    if (
      typeof parsed.energy === "number" &&
      Number.isFinite(parsed.energy) &&
      parsed.energy > 0 &&
      typeof parsed.unit === "string" &&
      typeof parsed.updated === "string"
    ) {
      return parsed;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export async function storeEnergy(env: Env, payload: IngestPayload): Promise<EnergyRecord> {
  const energy = Number.parseFloat(payload.state);

  if (!Number.isFinite(energy)) {
    throw new Error(`state is not numeric: ${payload.state}`);
  }

  const previousRecord = await readEnergy(env);

  const record: EnergyRecord = {
    energy,
    unit: payload.unit ?? "kWh",
    entity: payload.entity,
    updated: payload.updated ?? new Date().toISOString(),
    source: "ha_automation_push"
  };

  const parsedPowerKw = payload.powerKw !== undefined ? Number.parseFloat(payload.powerKw) : Number.NaN;
  if (Number.isFinite(parsedPowerKw)) {
    record.powerKw = parsedPowerKw;
    record.powerEntity = POWER_ENTITY_ID;
  } else if (typeof previousRecord?.powerKw === "number" && Number.isFinite(previousRecord.powerKw)) {
    record.powerKw = previousRecord.powerKw;
    record.powerEntity = previousRecord.powerEntity ?? POWER_ENTITY_ID;
  }

  if (energy > 0) {
    const lastMonthUsage: LastMonthUsage = {
      energy,
      unit: record.unit,
      updated: record.updated
    };
    await env.ENERGY_KV.put(KV_LAST_NON_ZERO_KEY, JSON.stringify(lastMonthUsage));
  } else {
    let lastMonthUsage = await readLastNonZeroUsage(env);

    if (!lastMonthUsage) {
      lastMonthUsage = toLastMonthUsage(previousRecord);
      if (lastMonthUsage) {
        await env.ENERGY_KV.put(KV_LAST_NON_ZERO_KEY, JSON.stringify(lastMonthUsage));
      }
    }

    if (lastMonthUsage) {
      record.lastMonthUsage = lastMonthUsage;
    }
  }

  await env.ENERGY_KV.put(KV_KEY, JSON.stringify(record));
  return record;
}

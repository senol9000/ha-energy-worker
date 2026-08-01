export interface Env {
  HA_WEBHOOK_TOKEN: string;
  ENERGY_KV: KVNamespace;
}

export interface IngestPayload {
  entity: string;
  state: string;
  unit?: string;
  updated?: string;
  powerKw?: string;
}

export interface LastMonthUsage {
  energy: number;
  unit: string;
  updated: string;
}

export interface EnergyRecord {
  energy: number;
  unit: string;
  entity: string;
  updated: string;
  source: string;
  powerKw?: number;
  powerEntity?: string;
  lastMonthUsage?: LastMonthUsage;
}

export const ENTITY_ID = "input_number.enegy_gokhan";
export const POWER_ENTITY_ID = "sensor.sonoff_10023297aa_power";
export const SERVICE_NAME = "Home Assistant Energy API";
export const KV_KEY = "energy_latest";
export const KV_LAST_NON_ZERO_KEY = "energy_last_non_zero";

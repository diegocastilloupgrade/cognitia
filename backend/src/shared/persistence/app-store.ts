import fs from "node:fs";
import path from "node:path";
import type { RuntimeSessionState } from "../../modules/execution/execution.types";
import type { SessionResult } from "../../modules/results/results.types";
import type { ScreeningSession } from "../../modules/sessions/sessions.types";

export interface AppStoreCounters {
  nextSessionId: number;
  nextResultId: number;
}

export interface AppStoreState {
  counters: AppStoreCounters;
  sessions: ScreeningSession[];
  results: SessionResult[];
  runtimeSessions: RuntimeSessionState[];
}

const DEFAULT_STORE_STATE: AppStoreState = {
  counters: {
    nextSessionId: 1,
    nextResultId: 1,
  },
  sessions: [],
  results: [],
  runtimeSessions: [],
};

let cachedStorePath: string | null = null;
let cachedStoreState: AppStoreState | null = null;

function cloneStoreState<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function resolveStorePath(): string {
  if (process.env.COGNITIA_STORE_FILE) {
    return path.resolve(process.env.COGNITIA_STORE_FILE);
  }

  return path.resolve(process.cwd(), "data", "app-store.json");
}

function ensureStoreDirectory(storePath: string): void {
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
}

function normalizeStoreState(value: Partial<AppStoreState> | null | undefined): AppStoreState {
  return {
    counters: {
      nextSessionId: value?.counters?.nextSessionId ?? 1,
      nextResultId: value?.counters?.nextResultId ?? 1,
    },
    sessions: Array.isArray(value?.sessions) ? value.sessions : [],
    results: Array.isArray(value?.results) ? value.results : [],
    runtimeSessions: Array.isArray(value?.runtimeSessions) ? value.runtimeSessions : [],
  };
}

function loadStoreState(): AppStoreState {
  const storePath = resolveStorePath();

  if (cachedStoreState && cachedStorePath === storePath) {
    return cachedStoreState;
  }

  ensureStoreDirectory(storePath);

  if (!fs.existsSync(storePath)) {
    cachedStorePath = storePath;
    cachedStoreState = cloneStoreState(DEFAULT_STORE_STATE);
    fs.writeFileSync(storePath, JSON.stringify(cachedStoreState, null, 2));
    return cachedStoreState;
  }

  const parsed = JSON.parse(fs.readFileSync(storePath, "utf8")) as Partial<AppStoreState>;
  cachedStorePath = storePath;
  cachedStoreState = normalizeStoreState(parsed);
  return cachedStoreState;
}

function persistStoreState(): void {
  if (!cachedStoreState || !cachedStorePath) {
    return;
  }

  ensureStoreDirectory(cachedStorePath);
  fs.writeFileSync(cachedStorePath, JSON.stringify(cachedStoreState, null, 2));
}

export function readStoreState(): AppStoreState {
  return cloneStoreState(loadStoreState());
}

export function updateStoreState<T>(updater: (state: AppStoreState) => T): T {
  const state = loadStoreState();
  const result = updater(state);
  persistStoreState();
  return result;
}

export function resetStoreStateForTests(): void {
  const storePath = resolveStorePath();
  cachedStorePath = null;
  cachedStoreState = null;

  if (fs.existsSync(storePath)) {
    fs.unlinkSync(storePath);
  }
}
export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ModuleInfo {
  name: string;
  version: string;
  status: "ready" | "mock";
}

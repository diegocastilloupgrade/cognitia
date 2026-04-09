export function logInfo(message: string, payload?: unknown): void {
  if (payload === undefined) {
    console.log(`[INFO] ${message}`);
    return;
  }

  console.log(`[INFO] ${message}`, payload);
}

import type { ItemTimingConfig } from "./execution.types";

export const ITEM_TIMING_CONFIGS: ItemTimingConfig[] = [
  { itemCode: "3.1", durationSeconds: 60, silenceThresholdSeconds: 5 },
  { itemCode: "3.4.1", durationSeconds: 45, silenceThresholdSeconds: 5 },
  { itemCode: "3.4.2", durationSeconds: 45, silenceThresholdSeconds: 5 },
];

export function getItemTimingConfig(itemCode: string): ItemTimingConfig {
  const config = ITEM_TIMING_CONFIGS.find((item) => item.itemCode === itemCode);

  if (config) {
    return config;
  }

  return {
    itemCode,
    durationSeconds: 60,
    silenceThresholdSeconds: 5,
  };
}

export function getNextItemCode(itemCode: string): string | null {
  const currentIndex = ITEM_TIMING_CONFIGS.findIndex((item) => item.itemCode === itemCode);

  if (currentIndex < 0) {
    return null;
  }

  const next = ITEM_TIMING_CONFIGS[currentIndex + 1];
  return next ? next.itemCode : null;
}

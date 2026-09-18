import { OverlayConfig } from '../types/dbd';

export const defaultOverlayConfig: OverlayConfig = {
  queue: { x: 56, y: 46, scale: 1, fontSize: 34 },
  pausedQueue: { x: 56, y: 360, scale: 0.82, fontSize: 26 },
  wheel: { x: 0, y: 0, scale: 1 },
};

export function normalizeOverlayConfig(config?: Partial<OverlayConfig> | null): OverlayConfig {
  return {
    queue: { ...defaultOverlayConfig.queue, ...config?.queue },
    pausedQueue: { ...defaultOverlayConfig.pausedQueue, ...config?.pausedQueue },
    wheel: { ...defaultOverlayConfig.wheel, ...config?.wheel },
  };
}

import { OverlayConfig, QueueItem, SpinEvent } from './dbd';

export type SocketMessage =
  | { type: 'queue:sync'; queue: QueueItem[] }
  | { type: 'queue:update'; queue: QueueItem[] }
  | { type: 'spin'; spin: SpinEvent }
  | { type: 'config:sync'; config: OverlayConfig }
  | { type: 'config:update'; config: OverlayConfig };

export type SocketServerMessage =
  | { type: 'queue:update'; queue: QueueItem[] }
  | { type: 'spin'; spin: SpinEvent }
  | { type: 'config:update'; config: OverlayConfig };

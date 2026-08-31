import { QueueItem, SpinEvent } from './dbd';

export type SocketMessage =
  | { type: 'queue:sync'; queue: QueueItem[] }
  | { type: 'queue:update'; queue: QueueItem[] }
  | { type: 'spin'; spin: SpinEvent };

export type SocketServerMessage =
  | { type: 'queue:update'; queue: QueueItem[] }
  | { type: 'spin'; spin: SpinEvent };

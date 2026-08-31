import { CharacterType, QueueItem } from '../types/dbd';

export function createQueueItem(
  title: string,
  lowPriority: boolean,
  randomType?: CharacterType,
): QueueItem {
  return {
    id: `${Date.now()}-${crypto.randomUUID()}`,
    title,
    lowPriority,
    randomType,
  };
}

export function insertByPriority(queue: QueueItem[], item: QueueItem) {
  if (item.lowPriority) {
    return [...queue, item];
  }

  const firstLowPriorityIndex = queue.findIndex((queueItem) => queueItem.lowPriority);

  if (firstLowPriorityIndex === -1) {
    return [...queue, item];
  }

  return [
    ...queue.slice(0, firstLowPriorityIndex),
    item,
    ...queue.slice(firstLowPriorityIndex),
  ];
}

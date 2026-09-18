import { CharacterType, QueueItem } from '../types/dbd';
import { createId } from './id';

export function createQueueItem(
  title: string,
  lowPriority: boolean,
  randomType?: CharacterType,
): QueueItem {
  return {
    id: createId(),
    title,
    lowPriority,
    randomType,
  };
}

export function insertByPriority(queue: QueueItem[], item: QueueItem) {
  const activeQueue = queue.filter((queueItem) => !queueItem.paused);
  const pausedQueue = queue.filter((queueItem) => queueItem.paused);

  if (item.lowPriority) {
    return [...activeQueue, item, ...pausedQueue];
  }

  const firstLowPriorityIndex = activeQueue.findIndex((queueItem) => queueItem.lowPriority);

  if (firstLowPriorityIndex === -1) {
    return [...activeQueue, item, ...pausedQueue];
  }

  return [
    ...activeQueue.slice(0, firstLowPriorityIndex),
    item,
    ...activeQueue.slice(firstLowPriorityIndex),
    ...pausedQueue,
  ];
}

export function moveQueueItem(queue: QueueItem[], draggedId: string, targetId: string, placeAfter = false) {
  if (draggedId === targetId) {
    return queue;
  }

  const draggedItem = queue.find((item) => item.id === draggedId);
  const targetItem = queue.find((item) => item.id === targetId);

  if (!draggedItem || !targetItem || Boolean(draggedItem.paused) !== Boolean(targetItem.paused)) {
    return queue;
  }

  const group = queue.filter((item) => Boolean(item.paused) === Boolean(draggedItem.paused));
  const otherItems = queue.filter((item) => Boolean(item.paused) !== Boolean(draggedItem.paused));
  const withoutDragged = group.filter((item) => item.id !== draggedId);
  const targetIndex = withoutDragged.findIndex((item) => item.id === targetId);
  withoutDragged.splice(targetIndex + (placeAfter ? 1 : 0), 0, draggedItem);

  return draggedItem.paused ? [...otherItems, ...withoutDragged] : [...withoutDragged, ...otherItems];
}

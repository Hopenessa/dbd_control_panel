import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { QueueItem } from '../types/dbd';
import { queueStorageKey } from '../utils/storageKeys';

function loadQueue() {
  try {
    const savedQueue = window.localStorage.getItem(queueStorageKey);
    return savedQueue ? (JSON.parse(savedQueue) as QueueItem[]) : [];
  } catch {
    return [];
  }
}

export function useSyncedQueue(): readonly [
  QueueItem[],
  Dispatch<SetStateAction<QueueItem[]>>,
] {
  const [queue, setQueue] = useState<QueueItem[]>(loadQueue);

  useEffect(() => {
    window.localStorage.setItem(queueStorageKey, JSON.stringify(queue));
  }, [queue]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === queueStorageKey) {
        setQueue(loadQueue());
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return [queue, setQueue] as const;
}

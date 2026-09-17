import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { QueueItem } from '../types/dbd';
import { queueStorageKey } from '../utils/storageKeys';
import { useAppSocket } from './useAppSocket';

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
  const lastServerQueue = useRef<string | null>(null);
  const hasLoadedServerQueue = useRef(false);
  const { isConnected, sendMessage } = useAppSocket((message) => {
    if (message.type === 'queue:update') {
      lastServerQueue.current = JSON.stringify(message.queue);
      hasLoadedServerQueue.current = true;
      setQueue(message.queue);
      window.localStorage.setItem(queueStorageKey, JSON.stringify(message.queue));
    }
  });

  useEffect(() => {
    window.localStorage.setItem(queueStorageKey, JSON.stringify(queue));
  }, [queue]);

  useEffect(() => {
    if (!isConnected) {
      hasLoadedServerQueue.current = false;
      return;
    }

    hasLoadedServerQueue.current = false;
    sendMessage({ type: 'queue:sync', queue: [] });
  }, [isConnected, sendMessage]);

  useEffect(() => {
    if (!isConnected || !hasLoadedServerQueue.current) {
      return;
    }

    const serializedQueue = JSON.stringify(queue);
    if (lastServerQueue.current === serializedQueue) {
      lastServerQueue.current = null;
      return;
    }

    sendMessage({ type: 'queue:update', queue });
  }, [isConnected, queue, sendMessage]);

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

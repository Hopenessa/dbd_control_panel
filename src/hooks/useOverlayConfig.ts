import { useEffect, useRef, useState } from 'react';
import { OverlayConfig } from '../types/dbd';
import { SocketServerMessage } from '../types/socket';
import { overlayConfigStorageKey } from '../utils/storageKeys';
import { defaultOverlayConfig } from '../utils/overlayConfig';
import { useAppSocket } from './useAppSocket';

function loadConfig() {
  try {
    const saved = window.localStorage.getItem(overlayConfigStorageKey);
    return saved ? (JSON.parse(saved) as OverlayConfig) : defaultOverlayConfig;
  } catch {
    return defaultOverlayConfig;
  }
}

export function useOverlayConfig() {
  const [config, setConfig] = useState<OverlayConfig>(loadConfig);
  const configRef = useRef(config);
  configRef.current = config;
  const { isConnected, sendMessage } = useAppSocket((message: SocketServerMessage) => {
    if (message.type === 'config:update') {
      setConfig(message.config);
      window.localStorage.setItem(overlayConfigStorageKey, JSON.stringify(message.config));
    }
  });

  useEffect(() => {
    if (isConnected) {
      sendMessage({ type: 'config:sync', config: configRef.current });
    }
  }, [isConnected, sendMessage]);

  const saveConfig = (nextConfig: OverlayConfig) => {
    setConfig(nextConfig);
    window.localStorage.setItem(overlayConfigStorageKey, JSON.stringify(nextConfig));
    sendMessage({ type: 'config:update', config: nextConfig });
  };

  return { config, saveConfig };
}

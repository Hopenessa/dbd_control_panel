import { useEffect, useRef, useState } from 'react';
import { OverlayConfig } from '../types/dbd';
import { SocketServerMessage } from '../types/socket';
import { overlayConfigStorageKey } from '../utils/storageKeys';
import { normalizeOverlayConfig } from '../utils/overlayConfig';
import { useAppSocket } from './useAppSocket';

function loadConfig() {
  try {
    const saved = window.localStorage.getItem(overlayConfigStorageKey);
    return saved ? normalizeOverlayConfig(JSON.parse(saved)) : normalizeOverlayConfig();
  } catch {
    return normalizeOverlayConfig();
  }
}

export function useOverlayConfig() {
  const [config, setConfig] = useState<OverlayConfig>(loadConfig);
  const configRef = useRef(config);
  configRef.current = config;
  const { isConnected, sendMessage } = useAppSocket((message: SocketServerMessage) => {
    if (message.type === 'config:update') {
      const nextConfig = normalizeOverlayConfig(message.config);
      setConfig(nextConfig);
      window.localStorage.setItem(overlayConfigStorageKey, JSON.stringify(nextConfig));
    }
  });

  useEffect(() => {
    if (isConnected) {
      sendMessage({ type: 'config:sync', config: configRef.current });
    }
  }, [isConnected, sendMessage]);

  const saveConfig = (nextConfig: OverlayConfig) => {
    const normalizedConfig = normalizeOverlayConfig(nextConfig);
    setConfig(normalizedConfig);
    window.localStorage.setItem(overlayConfigStorageKey, JSON.stringify(normalizedConfig));
    sendMessage({ type: 'config:update', config: normalizedConfig });
  };

  return { config, saveConfig };
}

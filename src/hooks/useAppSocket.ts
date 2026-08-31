import { useCallback, useEffect, useRef, useState } from 'react';
import { SocketMessage, SocketServerMessage } from '../types/socket';

function getSocketUrl() {
  if (process.env.REACT_APP_SOCKET_URL) {
    return process.env.REACT_APP_SOCKET_URL;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.hostname}:3001`;
}

export function useAppSocket(onMessage?: (message: SocketServerMessage) => void) {
  const socketRef = useRef<WebSocket | null>(null);
  const messageHandlerRef = useRef(onMessage);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    messageHandlerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const socket = new WebSocket(getSocketUrl());
    socketRef.current = socket;
    socket.onopen = () => setIsConnected(true);
    socket.onclose = () => setIsConnected(false);
    socket.onerror = () => setIsConnected(false);
    socket.onmessage = (event) => {
      try {
        messageHandlerRef.current?.(JSON.parse(event.data) as SocketServerMessage);
      } catch {
        return;
      }
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, []);

  const sendMessage = useCallback((message: SocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  return { isConnected, sendMessage };
}

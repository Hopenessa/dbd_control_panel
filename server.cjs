const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT || process.env.SOCKET_PORT || 3001);
const queueFile = path.join(__dirname, 'data', 'queue.json');
const configFile = path.join(__dirname, 'data', 'overlay-config.json');

function loadQueue() {
  try {
    const savedQueue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
    return Array.isArray(savedQueue) ? savedQueue : [];
  } catch {
    return [];
  }
}

function saveQueue(nextQueue) {
  fs.mkdirSync(path.dirname(queueFile), { recursive: true });
  fs.writeFileSync(queueFile, JSON.stringify(nextQueue, null, 2), 'utf8');
}

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(configFile, 'utf8'));
  } catch {
    return null;
  }
}

function saveConfig(nextConfig) {
  fs.mkdirSync(path.dirname(configFile), { recursive: true });
  fs.writeFileSync(configFile, JSON.stringify(nextConfig, null, 2), 'utf8');
}

let queue = loadQueue();
let config = loadConfig();
const server = new WebSocket.Server({ port });

function send(client, message) {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(message));
  }
}

function broadcast(message) {
  server.clients.forEach((client) => send(client, message));
}

server.on('connection', (client) => {
  client.on('message', (rawMessage) => {
    try {
      const message = JSON.parse(rawMessage.toString());

      if (message.type === 'queue:sync') {
        send(client, { type: 'queue:update', queue });
      }

      if (message.type === 'queue:update' && Array.isArray(message.queue)) {
        queue = message.queue;
        saveQueue(queue);
        broadcast({ type: 'queue:update', queue });
      }

      if (message.type === 'spin' && message.spin) {
        broadcast({ type: 'spin', spin: message.spin });
      }

      if (message.type === 'config:sync') {
        if (!config) config = message.config;
        send(client, { type: 'config:update', config });
      }

      if (message.type === 'config:update' && message.config) {
        config = message.config;
        saveConfig(config);
        broadcast({ type: 'config:update', config });
      }
    } catch {
      return;
    }
  });
});

server.on('listening', () => {
  console.log(`DBD WebSocket server is running on ws://localhost:${port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. The WebSocket server may already be running.`);
    return;
  }

  console.error(error);
});

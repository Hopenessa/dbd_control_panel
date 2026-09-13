const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT || process.env.SOCKET_PORT || 3001);
const queueFile = path.join(__dirname, 'data', 'queue.json');

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

let queue = loadQueue();
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

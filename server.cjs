const WebSocket = require('ws');

const port = Number(process.env.SOCKET_PORT || 3001);
let queue = null;
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
        if (!queue) queue = Array.isArray(message.queue) ? message.queue : [];
        send(client, { type: 'queue:update', queue });
      }

      if (message.type === 'queue:update' && Array.isArray(message.queue)) {
        queue = message.queue;
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

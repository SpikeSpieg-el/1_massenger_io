const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const publicIp = require('public-ip');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let waitingClient = null;

app.get('/get-ip', async (req, res) => {
    try {
        const ip = await publicIp.v4();
        res.json({ ip });
    } catch (error) {
        res.status(500).send('Error fetching IP');
    }
});

wss.on('connection', (ws) => {
    if (waitingClient) {
        const client1 = waitingClient;
        const client2 = ws;

        client1.send('Another user has joined. You can start chatting.');
        client2.send('You have joined the chat. You can start chatting.');

        client1.on('message', (message) => {
            client2.send(`User 1: ${message}`);
        });

        client2.on('message', (message) => {
            client1.send(`User 2: ${message}`);
        });

        client1.on('close', () => {
            client2.send('The other user has disconnected.');
        });

        client2.on('close', () => {
            client1.send('The other user has disconnected.');
        });

        waitingClient = null;
    } else {
        waitingClient = ws;
        ws.send('Waiting for another user to join...');
    }

    ws.on('close', () => {
        if (ws === waitingClient) {
            waitingClient = null;
        }
    });
});

server.listen(3001, () => {
    console.log('Server started on http://localhost:3001');
});

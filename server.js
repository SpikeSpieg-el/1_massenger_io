const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let waitingClient = null;

wss.on('connection', (ws) => {
    if (waitingClient) {
        const client1 = waitingClient;
        const client2 = ws;

        client1.send('Другой пользователь присоединился. Можно начать общение.');
        client2.send('Вы присоединились к чату. Можно начать общение.');

        client1.on('message', (message) => {
            client2.send(`Пользователь 1: ${message}`);
        });

        client2.on('message', (message) => {
            client1.send(`Пользователь 2: ${message}`);
        });

        client1.on('close', () => {
            client2.send('Другой пользователь отключился.');
        });

        client2.on('close', () => {
            client1.send('Другой пользователь отключился.');
        });

        waitingClient = null;
    } else {
        waitingClient = ws;
        ws.send('Ожидание другого пользователя...');
    }

    ws.on('close', () => {
        if (ws === waitingClient) {
            waitingClient = null;
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});

const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let waitingClient = null;

wss.on('connection', (ws) => {
    if (waitingClient) {
        // Если есть ждущий клиент, подключаем его с новым клиентом
        const client1 = waitingClient;
        const client2 = ws;

        client1.send('Another user has joined. You can start chatting.');
        client2.send('You have joined the chat. You can start chatting.');

        // Обрабатываем сообщения между двумя пользователями
        client1.on('message', (message) => {
            client2.send(`User 1: ${message}`);
        });

        client2.on('message', (message) => {
            client1.send(`User 2: ${message}`);
        });

        // Если один из клиентов отключился
        client1.on('close', () => {
            client2.send('The other user has disconnected.');
        });

        client2.on('close', () => {
            client1.send('The other user has disconnected.');
        });

        // Сбрасываем ожидание
        waitingClient = null;
    } else {
        // Если нет ждущих клиентов, сохраняем этот клиент как "ожидающего"
        waitingClient = ws;
        ws.send('Waiting for another user to join...');
    }

    ws.on('close', () => {
        if (ws === waitingClient) {
            waitingClient = null;
        }
    });
});

// Запуск сервера на порту 3000
server.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});

// server.js
const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Создаем WebSocket сервер
const wss = new WebSocket.Server({ server });

let clients = [];

wss.on('connection', (ws) => {
    if (clients.length >= 2) {
        // Если больше 2-х клиентов, закрываем соединение
        ws.send(JSON.stringify({ type: 'error', message: 'Only 2 clients allowed' }));
        ws.close();
        return;
    }
    
    // Добавляем подключенного клиента в список
    clients.push(ws);
    console.log('New client connected. Total clients:', clients.length);

    if (clients.length === 2) {
        // Оба клиента подключены, уведомляем их
        clients.forEach(client => client.send(JSON.stringify({ type: 'info', message: 'Both clients connected!' })));
    }

    ws.on('message', (message) => {
        // Пересылаем сообщение другому клиенту
        clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        // Удаляем клиента при отключении
        clients = clients.filter(client => client !== ws);
        console.log('Client disconnected. Total clients:', clients.length);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

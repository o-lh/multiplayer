import path from 'node:path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

import express from 'express';
import favicon from 'serve-favicon';

import { Server } from 'socket.io';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('a user connected');
})

server.listen(1337, () => {
    console.log('Listening on port 1337');
});

// https://socket.io/docs/v4/tutorial/step-3

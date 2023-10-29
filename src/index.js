import { dirname, join } from 'node:path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

import express from 'express';
import favicon from 'serve-favicon';

import { Server } from 'socket.io';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(favicon(join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(join(__dirname, 'public')));

// TODO: Store session IDs
// - https://socket.io/get-started/private-messaging-part-2/
// - https://socket.io/docs/v4/client-options/#auth
// - https://socket.io/how-to/deal-with-cookies

const players = [];

io.on('connection', (socket) => {
    // Send all existing players to new player
    for (let player of players) {
        socket.emit('player_connected', player.id, player.posX, player.posY, player.colourIndex);
    }

    // Broadcast new player to all other players
    socket.broadcast.emit('player_connected', socket.id, null, null, 0);

    players.push({ id: socket.id, posX: null, posY: null, colourIndex: 0 });

    socket.on('player_move', (posX, posY) => {
        const index = players.findIndex(player => player.id === socket.id);
        players[index].posX = posX;
        players[index].posY = posY;
        socket.broadcast.emit('player_move', socket.id, posX, posY);
    });

    socket.on('player_change_colour', (colourIndex) => {
        const index = players.findIndex(player => player.id === socket.id);
        players[index].colourIndex = colourIndex;
        socket.broadcast.emit('player_change_colour', socket.id, colourIndex);
    });

    socket.on('disconnect', () => {
        const index = players.findIndex(player => player.id === socket.id);
        players.splice(index, 1);
        socket.broadcast.emit('player_disconnected', socket.id);
    })
})

server.listen(1337, () => {
    console.log('Listening on port 1337');
});

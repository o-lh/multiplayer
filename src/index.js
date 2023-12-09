import { dirname, join } from 'node:path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

import { Server } from 'socket.io';
import express from 'express';
import favicon from 'serve-favicon';

// TODO: /shared or /common folder?
import { PlayerObject } from './public/scripts/player-object.js'
import { Vector2 } from './public/scripts/vector2.js'

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

/** @type {PlayerObject[]} */
const players = [];

/** @type {string[]} */
const serializedEntities = [];

const sockets = [];

io.on('connection', (socket) => {
    sockets.push(socket);

    socket.emit('connected');

    const player = new PlayerObject(socket.id, new Vector2(), 0);

    // Broadcast new player to all other players
    socket.broadcast.emit('player_connected', player);

    // Send all existing players to new player
    for (let otherPlayer of players) {
        socket.emit('player_connected', otherPlayer);
    }

    players.push(player);

    socket.on('player_move', position => {
        const index = players.findIndex(player => player.id === socket.id);
        players[index].position = position;
        socket.broadcast.emit('player_move', socket.id, position);
    });

    socket.on('create_entity', (entity, saveToServer) => {
        if (saveToServer) serializedEntities.push(entity);
        socket.broadcast.emit('create_entity', entity);
    });

    socket.on('projectile_hit', (socketID, projectileID, targetID) => {
        const index = players.findIndex(player => player.id === targetID);
        if (index !== -1) ++players[index].hitsTaken;
        socket.broadcast.emit('projectile_hit', socketID, projectileID, targetID);
    });

    socket.on('disconnect', () => {
        const index = players.findIndex(player => player.id === socket.id);
        players.splice(index, 1);
        const entityIndex = serializedEntities.findIndex(x => JSON.parse(x).socketID === socket.id);
        serializedEntities.splice(entityIndex, 1);
        socket.broadcast.emit('player_disconnected', socket.id);
    })
})

server.listen(1337, () => {
    console.log('Listening on port 1337');
});

import { dirname, join } from 'node:path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

import { Server } from 'socket.io';
import express from 'express';
import favicon from 'serve-favicon';

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

// TODO: /shared or /common or /engine folder?
/** @type {string[]} */
const serializedEntities = [];

io.on('connection', (socket) => {
    socket.emit('connected');

    for (const serializedEntity of serializedEntities) {
        socket.emit('create_entity', serializedEntity);
    }

    // TODO
    // socket.on('player_move', position => {
    //     const index = players.findIndex(player => player.id === socket.id);
    //     players[index].position = position;
    //     socket.broadcast.emit('player_move', socket.id, position);
    // });

    socket.on('create_entity', (entity, saveToServer) => {
        if (saveToServer) serializedEntities.push(entity);
        socket.broadcast.emit('create_entity', entity);
    });

    socket.on('projectile_hit', (owner, projectileID, targetID) => {
        // TODO: Modify entity on the server as well
        socket.broadcast.emit('projectile_hit', owner, projectileID, targetID);
    });

    socket.on('disconnect', () => {
        // TODO: Only remove the entity tagged as "Player"
        const index = serializedEntities.findIndex(x => JSON.parse(x).owner === socket.id);
        serializedEntities.splice(index, 1);
        socket.broadcast.emit('player_disconnected', socket.id);
    })
})

server.listen(1337, () => {
    console.log('Listening on port 1337');
});

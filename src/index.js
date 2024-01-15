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

const sockets = [];

// TODO: /shared or /common or /engine folder?
/** @type {any[]} */
const serializedEntities = [];

io.on('connection', (socket) => {
    sockets.push(socket);
    socket.emit('connected');

    for (const serializedEntity of serializedEntities) {
        socket.emit('create_entity', serializedEntity);
    }

    socket.on('create_entity', (entity, saveToServer) => {
        socket.broadcast.emit('create_entity', entity);
        if (saveToServer) serializedEntities.push(entity);
    });

    socket.on('move_entity', (id, newPosition) => {
        socket.broadcast.emit('move_entity', id, newPosition);
        const index = serializedEntities.findIndex(x => x.id === id);

        if (index === -1) return;

        // TODO: Store entities properly on the server
        const entity = serializedEntities[index];
        entity.position = newPosition;
        serializedEntities[index] = entity;
    });

    socket.on('projectile_hit', (projectileID, targetID, pointOfCollision) => {
        socket.broadcast.emit('projectile_hit', projectileID, targetID, pointOfCollision);
        // TODO: Modify entity on the server as well
    });

    socket.on('disconnect', () => {
        // TODO: Only remove the entity tagged as "Player"
        const index = serializedEntities.findIndex(x => x.owner === socket.id);

        if (index === -1) return;

        socket.broadcast.emit('destroy_entity', serializedEntities[index].id);
        serializedEntities.splice(index, 1);
    })
})

server.listen(1337, () => {
    console.log('Listening on port 1337');
});

let doorState = 0;

function update() {
    doorState = doorState === 0 ? 1 : 0;

    for (const socket of sockets) {
        socket.emit('doorState', doorState);
    }
}

setInterval(update, 1000);

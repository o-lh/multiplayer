import { v4 as uuidv4 } from './uuid/index.js';

import { Physics } from './physics.js';
import { Projectile } from './projectile.js';
import { Vector2 } from './vector2.js';
import { Game } from './game.js';

Game.run();

Game.socket.on('player_connected', newPlayer => {
    Game.otherPlayers.push(newPlayer);
});

Game.socket.on('player_move', (id, position) => {
    const index = Game.otherPlayers.findIndex(player => player.id === id);
    Game.otherPlayers[index].position = position;
});

Game.socket.on('player_change_colour', (id, colour) => {
    const index = Game.otherPlayers.findIndex(player => player.id === id);
    Game.otherPlayers[index].colour = colour;
});

Game.socket.on('create_projectile', projectile => {
    // TODO: Is there a better way to reconstruct these objects? Or not have to reconstruct them?
    Game.projectiles.unshift(new Projectile(
        projectile.id,
        projectile.owner,
        projectile.origin,
        projectile.direction,
        projectile.speed,
        projectile.head,
        projectile.tail
    ));
});

Game.socket.on('projectile_hit', (projectileID, targetID) => {
    const projectileIndex = Game.projectiles.findIndex(projectile => projectile.id === projectileID);
    Game.projectiles[projectileIndex].destroyed = true;

    if (targetID === Game.socket.id) {
        ++Game.hitsTaken;
    } else {
        const index = Game.otherPlayers.findIndex(player => player.id === targetID);
        ++Game.otherPlayers[index].hitsTaken;
    }
});

Game.socket.on('player_disconnected', id => {
    const index = Game.otherPlayers.findIndex(player => player.id === id);
    Game.otherPlayers.splice(index, 1);
});

// Set the player's initial position on the server
Game.socket.emit('player_move', Game.playerPosition);

// TODO: Manage the deltaTime for the first frame properly (currently includes loading time)
let prev = 0;
let deltaTime;

function tick(t) {
    deltaTime = (t - prev) / 1000;
    prev = t;

    Game.playerPrevious = structuredClone(Game.playerPosition);

    if (Game.holdW) Game.playerPosition.y -= Game.PLAYER_SPEED * deltaTime;
    if (Game.holdD) Game.playerPosition.x += Game.PLAYER_SPEED * deltaTime;
    if (Game.holdS) Game.playerPosition.y += Game.PLAYER_SPEED * deltaTime;
    if (Game.holdA) Game.playerPosition.x -= Game.PLAYER_SPEED * deltaTime;

    if (Game.playerPosition.y - Game.PLAYER_RADIUS < -Game.CANVAS_WORLD_SPACE_HEIGHT / 2)
        Game.playerPosition.y = -Game.CANVAS_WORLD_SPACE_HEIGHT / 2 + Game.PLAYER_RADIUS;
    if (Game.playerPosition.x + Game.PLAYER_RADIUS > Game.CANVAS_WORLD_SPACE_WIDTH / 2)
        Game.playerPosition.x = Game.CANVAS_WORLD_SPACE_WIDTH / 2 - Game.PLAYER_RADIUS;
    if (Game.playerPosition.y + Game.PLAYER_RADIUS > Game.CANVAS_WORLD_SPACE_HEIGHT / 2)
        Game.playerPosition.y = Game.CANVAS_WORLD_SPACE_HEIGHT / 2 - Game.PLAYER_RADIUS;
    if (Game.playerPosition.x - Game.PLAYER_RADIUS < -Game.CANVAS_WORLD_SPACE_WIDTH / 2)
        Game.playerPosition.x = -Game.CANVAS_WORLD_SPACE_WIDTH / 2 + Game.PLAYER_RADIUS;

    if (Game.holdAttack) {
        if (Game.attackT <= 0) {
            const clickPosition = Game.screenSpacePointToWorldSpace(
                new Vector2(
                    Game.mousePosition.x - Game.canvas.offsetLeft,
                    Game.mousePosition.y - Game.canvas.offsetTop
                )
            );

            const direction = Vector2.subtract(clickPosition, Game.playerPosition).normalized;

            const projectile = new Projectile(
                uuidv4(),
                Game.socket.id,
                Vector2.add(
                    structuredClone(Game.playerPosition),
                    Vector2.multiplyScalar(direction, Game.PLAYER_RADIUS)
                ),
                direction,
                50
            );

            // TODO: CreateNetworkObject function?
            Game.projectiles.unshift(projectile);
            Game.socket.emit('create_projectile', projectile);

            Game.attackT += Game.ATTACK_INTERVAL;
        }
    }

    if (!Vector2.equal(Game.playerPosition, Game.playerPrevious))
        Game.socket.emit('player_move', Game.playerPosition);

    Game.context.clearRect(0, 0, Game.canvas.width, Game.canvas.height);

    for (let i = Game.projectiles.length - 1; i >= 0; --i) {
        Game.projectiles[i].update(deltaTime);

        if (Game.projectiles[i].owner === Game.socket.id) {
            for (const player of Game.otherPlayers) {
                if (Physics.lineCircleCollision(
                    Game.projectiles[i].tail,
                    Game.projectiles[i].head,
                    player.position,
                    Game.PLAYER_RADIUS
                )) {
                    Game.socket.emit('projectile_hit', Game.projectiles[i].id, player.id);
                    Game.projectiles[i].destroyed = true;
                    ++player.hitsTaken;
                }
            }
        }

        if (Game.projectiles[i].destroyed) {
            Game.projectiles.splice(i, 1);
            continue;
        }

        const lineStart = Game.worldSpacePointToScreenSpace(Game.projectiles[i].tail);
        const lineEnd = Game.worldSpacePointToScreenSpace(Game.projectiles[i].head);

        Game.context.beginPath();
        Game.context.strokeStyle = 'rgb(255, 255, 255)';
        Game.context.lineWidth = 2;
        Game.context.moveTo(lineStart.x, lineStart.y);
        Game.context.lineTo(lineEnd.x, lineEnd.y);
        Game.context.stroke();
    }

    for (const player of Game.otherPlayers) {
        const playerPos = Game.worldSpacePointToScreenSpace(player.position);

        Game.context.beginPath();
        Game.context.arc(playerPos.x, playerPos.y, Game.playerRadiusScreenSpace, 0, 2 * Math.PI, false);
        Game.context.fillStyle = Game.PLAYER_COLOURS[player.colour];
        Game.context.fill();
    }

    const playerPos = Game.worldSpacePointToScreenSpace(Game.playerPosition);

    Game.context.beginPath();
    Game.context.arc(playerPos.x, playerPos.y, Game.playerRadiusScreenSpace, 0, 2 * Math.PI, false);
    Game.context.fillStyle = Game.PLAYER_COLOURS[Game.playerColour];
    Game.context.fill();

    for (const player of Game.otherPlayers) {
        const playerPos = Game.worldSpacePointToScreenSpace(player.position);
        Game.context.fillStyle = Game.PLAYER_COLOURS[player.colour];
        Game.context.fillText(player.hitsTaken, playerPos.x, playerPos.y - Game.playerRadiusScreenSpace - 5);
    }

    Game.context.fillStyle = Game.PLAYER_COLOURS[Game.playerColour];
    Game.context.fillText(Game.hitsTaken, playerPos.x, playerPos.y - Game.playerRadiusScreenSpace - 5);

    Game.attackT -= deltaTime;
    if (Game.attackT < 0) Game.attackT = 0;

    requestAnimationFrame(tick);
}

// TODO: socket.id is undefined initially. Perhaps only start once it is defined?
requestAnimationFrame(tick);

// TODO: Untie game logic from frame rate

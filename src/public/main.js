import { v4 as uuidv4 } from './uuid/index.js';

import { Physics } from './physics.js';
import { Projectile } from './projectile.js';
import { Vector2 } from './vector2.js';
import { Game } from './game.js';

const socket = io();

let smallerDimension = innerWidth > innerHeight ? innerHeight : innerWidth;
Game.canvas.width = smallerDimension;
Game.canvas.height = smallerDimension;

Game.context.font = '20px sans-serif';
Game.context.textAlign = 'center';

const PLAYER_RADIUS = 0.25;
let playerRadiusScreenSpace = Game.worldSpaceLengthToScreenSpace(PLAYER_RADIUS);

addEventListener('contextmenu', event => event.preventDefault());

addEventListener('resize', _ => {
    smallerDimension = innerWidth > innerHeight ? innerHeight : innerWidth;
    Game.canvas.width = smallerDimension;
    Game.canvas.height = smallerDimension;

    Game.context.font = '20px sans-serif';
    Game.context.textAlign = 'center';

    playerRadiusScreenSpace = Game.worldSpaceLengthToScreenSpace(PLAYER_RADIUS);
});

let mousePosition = new Vector2();
let holdW = false;
let holdA = false;
let holdS = false;
let holdD = false;
let holdAttack = false;
const ATTACK_INTERVAL = 0.2;
let attackT = 0;

const PLAYER_COLOURS = [
    'rgb(255, 0, 0)',
    'rgb(255, 128, 0)',
    'rgb(255, 255, 0)',
    'rgb(0, 255, 0)',
    'rgb(0, 128, 255)',
    'rgb(64, 0, 255)',
    'rgb(192, 0, 255)'
];

let playerColour = 0;
let hitsTaken = 0;

addEventListener('keydown', event => {
    if (event.repeat) return;

    switch (event.code) {
        case 'KeyW': holdW = true; break;
        case 'KeyA': holdA = true; break;
        case 'KeyS': holdS = true; break;
        case 'KeyD': holdD = true; break;
        case 'ArrowUp': holdW = true; break;
        case 'ArrowLeft': holdA = true; break;
        case 'ArrowDown': holdS = true; break;
        case 'ArrowRight': holdD = true; break;
        case 'Space': {
            ++playerColour;
            if (playerColour >= PLAYER_COLOURS.length) playerColour = 0;
            socket.emit('player_change_colour', playerColour);
            break;
        }
    }
});

addEventListener('keyup', event => {
    switch (event.code) {
        case 'KeyW': holdW = false; break;
        case 'KeyA': holdA = false; break;
        case 'KeyS': holdS = false; break;
        case 'KeyD': holdD = false; break;
        case 'ArrowUp': holdW = false; break;
        case 'ArrowLeft': holdA = false; break;
        case 'ArrowDown': holdS = false; break;
        case 'ArrowRight': holdD = false; break;
    }
});

addEventListener('mousedown', event => {
    if (event.button !== 0) return;

    holdAttack = true;
    mousePosition.x = event.x;
    mousePosition.y = event.y;
});

addEventListener('mouseup', event => { if (event.button === 0) holdAttack = false; });

addEventListener('mousemove', event => {
    mousePosition.x = event.x;
    mousePosition.y = event.y;
});

/** @type {Player[]} */
const otherPlayers = [];

/** @type {Projectile[]} */
const projectiles = [];

socket.on('player_connected', newPlayer => {
    otherPlayers.push(newPlayer);
});

socket.on('player_move', (id, position) => {
    const index = otherPlayers.findIndex(player => player.id === id);
    otherPlayers[index].position = position;
});

socket.on('player_change_colour', (id, colour) => {
    const index = otherPlayers.findIndex(player => player.id === id);
    otherPlayers[index].colour = colour;
});

socket.on('create_projectile', projectile => {
    // TODO: Is there a better way to reconstruct these objects? Or not have to reconstruct them?
    projectiles.unshift(new Projectile(
        projectile.id,
        projectile.owner,
        projectile.origin,
        projectile.direction,
        projectile.speed,
        projectile.head,
        projectile.tail
    ));
});

socket.on('projectile_hit', (projectileID, targetID) => {
    const projectileIndex = projectiles.findIndex(projectile => projectile.id === projectileID);
    projectiles[projectileIndex].destroyed = true;

    if (targetID === socket.id) {
        ++hitsTaken;
    } else {
        const index = otherPlayers.findIndex(player => player.id === targetID);
        ++otherPlayers[index].hitsTaken;
    }
});

socket.on('player_disconnected', id => {
    const index = otherPlayers.findIndex(player => player.id === id);
    otherPlayers.splice(index, 1);
});

const PLAYER_SPEED = 4;
let playerPrevious = new Vector2();
let playerPosition = new Vector2(
    (Math.random() * Game.CANVAS_WORLD_SPACE_WIDTH) - Game.CANVAS_WORLD_SPACE_WIDTH / 2,
    (Math.random() * Game.CANVAS_WORLD_SPACE_HEIGHT) - Game.CANVAS_WORLD_SPACE_HEIGHT / 2
);

// Set the player's initial position on the server
socket.emit('player_move', playerPosition);

// TODO: Manage the deltaTime for the first frame properly (currently includes loading time)
let prev = 0;
let deltaTime;

function tick(t) {
    deltaTime = (t - prev) / 1000;
    prev = t;

    playerPrevious = structuredClone(playerPosition);

    if (holdW) playerPosition.y -= PLAYER_SPEED * deltaTime;
    if (holdD) playerPosition.x += PLAYER_SPEED * deltaTime;
    if (holdS) playerPosition.y += PLAYER_SPEED * deltaTime;
    if (holdA) playerPosition.x -= PLAYER_SPEED * deltaTime;

    if (playerPosition.y - PLAYER_RADIUS < -Game.CANVAS_WORLD_SPACE_HEIGHT / 2)
        playerPosition.y = -Game.CANVAS_WORLD_SPACE_HEIGHT / 2 + PLAYER_RADIUS;
    if (playerPosition.x + PLAYER_RADIUS > Game.CANVAS_WORLD_SPACE_WIDTH / 2)
        playerPosition.x = Game.CANVAS_WORLD_SPACE_WIDTH / 2 - PLAYER_RADIUS;
    if (playerPosition.y + PLAYER_RADIUS > Game.CANVAS_WORLD_SPACE_HEIGHT / 2)
        playerPosition.y = Game.CANVAS_WORLD_SPACE_HEIGHT / 2 - PLAYER_RADIUS;
    if (playerPosition.x - PLAYER_RADIUS < -Game.CANVAS_WORLD_SPACE_WIDTH / 2)
        playerPosition.x = -Game.CANVAS_WORLD_SPACE_WIDTH / 2 + PLAYER_RADIUS;

    if (holdAttack) {
        if (attackT <= 0) {
            const clickPosition = Game.screenSpacePointToWorldSpace(
                new Vector2(
                    mousePosition.x - Game.canvas.offsetLeft,
                    mousePosition.y - Game.canvas.offsetTop
                )
            );

            const direction = Vector2.subtract(clickPosition, playerPosition).normalized;

            const projectile = new Projectile(
                uuidv4(),
                socket.id,
                Vector2.add(
                    structuredClone(playerPosition),
                    Vector2.multiplyScalar(direction, PLAYER_RADIUS)
                ),
                direction,
                50
            );

            // TODO: CreateNetworkObject function?
            projectiles.unshift(projectile);
            socket.emit('create_projectile', projectile);

            attackT += ATTACK_INTERVAL;
        }
    }

    if (!Vector2.equal(playerPosition, playerPrevious))
        socket.emit('player_move', playerPosition);

    Game.context.clearRect(0, 0, Game.canvas.width, Game.canvas.height);

    for (let i = projectiles.length - 1; i >= 0; --i) {
        projectiles[i].update(deltaTime);

        if (projectiles[i].owner === socket.id) {
            for (const player of otherPlayers) {
                if (Physics.lineCircleCollision(
                    projectiles[i].tail,
                    projectiles[i].head,
                    player.position,
                    PLAYER_RADIUS
                )) {
                    socket.emit('projectile_hit', projectiles[i].id, player.id);
                    projectiles[i].destroyed = true;
                    ++player.hitsTaken;
                }
            }
        }

        if (projectiles[i].destroyed) {
            projectiles.splice(i, 1);
            continue;
        }

        const lineStart = Game.worldSpacePointToScreenSpace(projectiles[i].tail);
        const lineEnd = Game.worldSpacePointToScreenSpace(projectiles[i].head);

        Game.context.beginPath();
        Game.context.strokeStyle = 'rgb(255, 255, 255)';
        Game.context.lineWidth = 2;
        Game.context.moveTo(lineStart.x, lineStart.y);
        Game.context.lineTo(lineEnd.x, lineEnd.y);
        Game.context.stroke();
    }

    for (const player of otherPlayers) {
        const playerPos = Game.worldSpacePointToScreenSpace(player.position);

        Game.context.beginPath();
        Game.context.arc(playerPos.x, playerPos.y, playerRadiusScreenSpace, 0, 2 * Math.PI, false);
        Game.context.fillStyle = PLAYER_COLOURS[player.colour];
        Game.context.fill();
    }

    const playerPos = Game.worldSpacePointToScreenSpace(playerPosition);

    Game.context.beginPath();
    Game.context.arc(playerPos.x, playerPos.y, playerRadiusScreenSpace, 0, 2 * Math.PI, false);
    Game.context.fillStyle = PLAYER_COLOURS[playerColour];
    Game.context.fill();

    for (const player of otherPlayers) {
        const playerPos = Game.worldSpacePointToScreenSpace(player.position);
        Game.context.fillStyle = PLAYER_COLOURS[player.colour];
        Game.context.fillText(player.hitsTaken, playerPos.x, playerPos.y - playerRadiusScreenSpace - 5);
    }

    Game.context.fillStyle = PLAYER_COLOURS[playerColour];
    Game.context.fillText(hitsTaken, playerPos.x, playerPos.y - playerRadiusScreenSpace - 5);

    attackT -= deltaTime;
    if (attackT < 0) attackT = 0;

    requestAnimationFrame(tick);
}

// TODO: socket.id is undefined initially. Perhaps only start once it is defined?
requestAnimationFrame(tick);

// TODO: Untie game logic from frame rate

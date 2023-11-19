import { v4 as uuidv4 } from './uuid/index.js';

import { Physics } from './physics.js';
import { Projectile } from './projectile.js';
import { Vector2 } from './vector2.js';

const socket = io();

const CANVAS_WORLD_SPACE_WIDTH = 20;
const CANVAS_WORLD_SPACE_HEIGHT = 20;

function worldSpacePointToScreenSpace(point) {
    return new Vector2(
        canvas.width / 2 + point.x * canvas.width / CANVAS_WORLD_SPACE_WIDTH,
        canvas.height / 2 + point.y * canvas.height / CANVAS_WORLD_SPACE_HEIGHT
    );
}

// TODO: What about for a non-square canvas?
function worldSpaceLengthToScreenSpace(length) {
    return length * canvas.height / CANVAS_WORLD_SPACE_HEIGHT;
}

function screenSpacePointToWorldSpace(point) {
    return new Vector2(
        point.x / canvas.width * CANVAS_WORLD_SPACE_WIDTH - CANVAS_WORLD_SPACE_WIDTH / 2,
        point.y / canvas.height * CANVAS_WORLD_SPACE_HEIGHT - CANVAS_WORLD_SPACE_HEIGHT / 2
    );
}

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
let smallerDimension = innerWidth > innerHeight ? innerHeight : innerWidth;
canvas.width = smallerDimension;
canvas.height = smallerDimension;

const PLAYER_RADIUS = 0.25;
let playerRadiusScreenSpace = worldSpaceLengthToScreenSpace(PLAYER_RADIUS);

addEventListener('contextmenu', event => event.preventDefault());

addEventListener('resize', _ => {
    smallerDimension = innerWidth > innerHeight ? innerHeight : innerWidth;
    canvas.width = smallerDimension;
    canvas.height = smallerDimension;

    playerRadiusScreenSpace = worldSpaceLengthToScreenSpace(PLAYER_RADIUS);
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

const otherPlayers = [];
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

socket.on('player_disconnected', id => {
    const index = otherPlayers.findIndex(player => player.id === id);
    otherPlayers.splice(index, 1);
});

const PLAYER_SPEED = 4;
let playerPrevious = new Vector2();
let playerPosition = new Vector2(
    (Math.random() * CANVAS_WORLD_SPACE_WIDTH) - CANVAS_WORLD_SPACE_WIDTH / 2,
    (Math.random() * CANVAS_WORLD_SPACE_HEIGHT) - CANVAS_WORLD_SPACE_HEIGHT / 2
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

    if (playerPosition.y - PLAYER_RADIUS < -CANVAS_WORLD_SPACE_HEIGHT / 2)
        playerPosition.y = -CANVAS_WORLD_SPACE_HEIGHT / 2 + PLAYER_RADIUS;
    if (playerPosition.x + PLAYER_RADIUS > CANVAS_WORLD_SPACE_WIDTH / 2)
        playerPosition.x = CANVAS_WORLD_SPACE_WIDTH / 2 - PLAYER_RADIUS;
    if (playerPosition.y + PLAYER_RADIUS > CANVAS_WORLD_SPACE_HEIGHT / 2)
        playerPosition.y = CANVAS_WORLD_SPACE_HEIGHT / 2 - PLAYER_RADIUS;
    if (playerPosition.x - PLAYER_RADIUS < -CANVAS_WORLD_SPACE_WIDTH / 2)
        playerPosition.x = -CANVAS_WORLD_SPACE_WIDTH / 2 + PLAYER_RADIUS;

    if (holdAttack) {
        if (attackT <= 0) {
            const clickPosition = screenSpacePointToWorldSpace(
                new Vector2(
                    mousePosition.x - canvas.offsetLeft,
                    mousePosition.y - canvas.offsetTop
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
                5/*0*/,
                structuredClone(playerPosition),
                structuredClone(playerPosition)
            );

            // TODO: CreateNetworkObject function?
            projectiles.unshift(projectile);
            socket.emit('create_projectile', projectile);

            attackT += ATTACK_INTERVAL;
        }
    }

    if (!Vector2.equal(playerPosition, playerPrevious))
        socket.emit('player_move', playerPosition);

    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = projectiles.length - 1; i >= 0; --i) {
        projectiles[i].update(deltaTime);

        if (projectiles[i].destroyed) {
            projectiles.splice(i, 1);
            continue;
        }

        if (otherPlayers[0]) {
            let point = Physics.lineCircleCollision(
                projectiles[i].tail,
                projectiles[i].head,
                otherPlayers[0].position,
                PLAYER_RADIUS
            );

            point = worldSpacePointToScreenSpace(point);

            context.beginPath();
            context.arc(point.x, point.y, playerRadiusScreenSpace / 2, 0, 2 * Math.PI, false);
            context.fillStyle = PLAYER_COLOURS[playerColour];
            context.fill();
        }

        const lineStart = worldSpacePointToScreenSpace(projectiles[i].tail);
        const lineEnd = worldSpacePointToScreenSpace(projectiles[i].head);

        context.beginPath();
        context.strokeStyle = 'rgb(255, 255, 255)';
        context.lineWidth = 2;
        context.moveTo(lineStart.x, lineStart.y);
        context.lineTo(lineEnd.x, lineEnd.y);
        context.stroke();
    }

    for (const player of otherPlayers) {
        const playerPos = worldSpacePointToScreenSpace(player.position);

        context.beginPath();
        context.arc(playerPos.x, playerPos.y, playerRadiusScreenSpace, 0, 2 * Math.PI, false);
        context.fillStyle = PLAYER_COLOURS[player.colour];
        context.fill();
    }

    const playerPos = worldSpacePointToScreenSpace(playerPosition);

    context.beginPath();
    context.arc(playerPos.x, playerPos.y, playerRadiusScreenSpace, 0, 2 * Math.PI, false);
    context.fillStyle = PLAYER_COLOURS[playerColour];
    context.fill();

    attackT -= deltaTime;
    if (attackT < 0) attackT = 0;

    requestAnimationFrame(tick);
}

// TODO: socket.id is undefined initially. Perhaps only start once it is defined?
requestAnimationFrame(tick);

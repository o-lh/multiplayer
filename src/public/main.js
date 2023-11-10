const socket = io();

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

const CANVAS_WORLD_SPACE_WIDTH = 20;
const CANVAS_WORLD_SPACE_HEIGHT = 20;

function worldSpacePointToScreenSpace(point) {
    return new Point(
        canvas.width / 2 + point.x * canvas.width / CANVAS_WORLD_SPACE_WIDTH,
        canvas.height / 2 + point.y * canvas.height / CANVAS_WORLD_SPACE_HEIGHT
    );
}

// TODO: What about for a non-square canvas?
function worldSpaceLengthToScreenSpace(length) {
    return length * canvas.height / CANVAS_WORLD_SPACE_HEIGHT;
}

function screenSpacePointToWorldSpace(point) {
    return new Point(
        point.x / canvas.width * CANVAS_WORLD_SPACE_WIDTH - CANVAS_WORLD_SPACE_WIDTH / 2,
        point.y / canvas.height * CANVAS_WORLD_SPACE_HEIGHT - CANVAS_WORLD_SPACE_HEIGHT / 2
    );
}

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
let smallerDimension = innerWidth > innerHeight ? innerHeight : innerWidth;
canvas.width = smallerDimension;
canvas.height = smallerDimension;

const PLAYER_SIZE = 0.5;
let playerSizeScreenSpace = worldSpaceLengthToScreenSpace(PLAYER_SIZE);

addEventListener('resize', _ => {
    smallerDimension = innerWidth > innerHeight ? innerHeight : innerWidth;
    canvas.width = smallerDimension;
    canvas.height = smallerDimension;

    playerSizeScreenSpace = worldSpaceLengthToScreenSpace(PLAYER_SIZE);
});

let holdW = false;
let holdA = false;
let holdS = false;
let holdD = false;

const PLAYER_COLOURS = [
    'rgb(255, 0, 0)',
    'rgb(255, 128, 0)',
    'rgb(255, 255, 0)',
    'rgb(0, 255, 0)',
    'rgb(0, 128, 255)',
    'rgb(64, 0, 255)',
    'rgb(192, 0, 255)'
];

let playerColourIndex = 0;

addEventListener('keydown', event => {
    if (event.repeat) return;

    switch (event.code) {
        case 'KeyW': holdW = true; break;
        case 'KeyA': holdA = true; break;
        case 'KeyS': holdS = true; break;
        case 'KeyD': holdD = true; break;
        case 'Space': {
            ++playerColourIndex;
            if (playerColourIndex >= PLAYER_COLOURS.length) playerColourIndex = 0;
            socket.emit('player_change_colour', playerColourIndex);
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
    }
});

// TODO: Make canvas fill the entire window
canvas.addEventListener('mousedown', event => {
    if (event.button !== 0) return;

    console.log(screenSpacePointToWorldSpace(
        new Point(event.x - canvas.offsetLeft, event.y - canvas.offsetTop)
    ));
});

const otherPlayers = [];

socket.on('player_connected', (id, posX, posY, colourIndex) => {
    otherPlayers.push({ id, posX, posY, colourIndex });
});

socket.on('player_move', (id, posX, posY) => {
    const index = otherPlayers.findIndex(player => player.id === id);
    otherPlayers[index].posX = posX;
    otherPlayers[index].posY = posY;
});

socket.on('player_change_colour', (id, colourIndex) => {
    const index = otherPlayers.findIndex(player => player.id === id);
    otherPlayers[index].colourIndex = colourIndex;
});

socket.on('player_disconnected', (id) => {
    const index = otherPlayers.findIndex(player => player.id === id);
    otherPlayers.splice(index, 1);
});

const PLAYER_SPEED = 4;
let playerPreviousX = null;
let playerPreviousY = null;
let playerPositionX = (Math.random() * CANVAS_WORLD_SPACE_WIDTH) - CANVAS_WORLD_SPACE_WIDTH / 2;
let playerPositionY = (Math.random() * CANVAS_WORLD_SPACE_HEIGHT) - CANVAS_WORLD_SPACE_HEIGHT / 2;

// Set the player's initial position on the server
socket.emit('player_move', playerPositionX, playerPositionY);

let prev = 0;
let deltaTime = 0;

function tick(t) {
    deltaTime = (t - prev) / 1000;
    prev = t;

    playerPreviousX = playerPositionX;
    playerPreviousY = playerPositionY;

    if (holdW) playerPositionY -= PLAYER_SPEED * deltaTime;
    if (holdD) playerPositionX += PLAYER_SPEED * deltaTime;
    if (holdS) playerPositionY += PLAYER_SPEED * deltaTime;
    if (holdA) playerPositionX -= PLAYER_SPEED * deltaTime;

    if (playerPositionX !== playerPreviousX || playerPositionY !== playerPreviousY)
        socket.emit('player_move', playerPositionX, playerPositionY);

    if (playerPositionY - PLAYER_SIZE / 2 < -CANVAS_WORLD_SPACE_HEIGHT / 2)
        playerPositionY = -CANVAS_WORLD_SPACE_HEIGHT / 2 + PLAYER_SIZE / 2;
    if (playerPositionX + PLAYER_SIZE / 2 > CANVAS_WORLD_SPACE_WIDTH / 2)
        playerPositionX = CANVAS_WORLD_SPACE_WIDTH / 2 - PLAYER_SIZE / 2;
    if (playerPositionY + PLAYER_SIZE / 2 > CANVAS_WORLD_SPACE_HEIGHT / 2)
        playerPositionY = CANVAS_WORLD_SPACE_HEIGHT / 2 - PLAYER_SIZE / 2;
    if (playerPositionX - PLAYER_SIZE / 2 < -CANVAS_WORLD_SPACE_WIDTH / 2)
        playerPositionX = -CANVAS_WORLD_SPACE_WIDTH / 2 + PLAYER_SIZE / 2;

    context.clearRect(0, 0, canvas.width, canvas.height);

    for (const player of otherPlayers) {
        if (player.posX === null) continue;

        const playerPos = worldSpacePointToScreenSpace(new Point(player.posX, player.posY));

        context.fillStyle = PLAYER_COLOURS[player.colourIndex];
        context.fillRect(
            playerPos.x - playerSizeScreenSpace / 2,
            playerPos.y - playerSizeScreenSpace / 2,
            playerSizeScreenSpace,
            playerSizeScreenSpace
        );
    }

    const playerPos = worldSpacePointToScreenSpace(new Point(playerPositionX, playerPositionY));

    context.fillStyle = PLAYER_COLOURS[playerColourIndex];
    context.fillRect(
        playerPos.x - playerSizeScreenSpace / 2,
        playerPos.y - playerSizeScreenSpace / 2,
        playerSizeScreenSpace,
        playerSizeScreenSpace
    );

    requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

const socket = io();

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};

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

const PLAYER_SPEED = 200;
const PLAYER_SIZE = 25;
let playerPreviousX = null;
let playerPreviousY = null;
let playerPositionX = Math.random() * canvas.width;
let playerPositionY = Math.random() * canvas.height;

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

    if (playerPositionY - PLAYER_SIZE / 2 < 0)
        playerPositionY = 0 + PLAYER_SIZE / 2;
    if (playerPositionX + PLAYER_SIZE / 2 > canvas.width)
        playerPositionX = canvas.width - PLAYER_SIZE / 2;
    if (playerPositionY + PLAYER_SIZE / 2 > canvas.height)
        playerPositionY = canvas.height - PLAYER_SIZE / 2;
    if (playerPositionX - PLAYER_SIZE / 2 < 0)
        playerPositionX = 0 + PLAYER_SIZE / 2;

    context.clearRect(0, 0, canvas.width, canvas.height);

    for (player of otherPlayers) {
        if (player.posX === null) continue;

        context.fillStyle = PLAYER_COLOURS[player.colourIndex];
        context.fillRect(
            player.posX - PLAYER_SIZE / 2,
            player.posY - PLAYER_SIZE / 2,
            PLAYER_SIZE,
            PLAYER_SIZE
        );
    }

    context.fillStyle = PLAYER_COLOURS[playerColourIndex];
    context.fillRect(
        playerPositionX - PLAYER_SIZE / 2,
        playerPositionY - PLAYER_SIZE / 2,
        PLAYER_SIZE,
        PLAYER_SIZE
    );

    requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

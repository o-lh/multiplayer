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

let playerPositionX = canvas.width / 2;
let playerPositionY = canvas.height / 2;
const PLAYER_SPEED = 200;
const PLAYER_SIZE = 25;

let prev = 0;
let deltaTime = 0;

function tick(t) {
    deltaTime = (t - prev) / 1000;
    prev = t;

    if (holdW) playerPositionY -= PLAYER_SPEED * deltaTime;
    if (holdD) playerPositionX += PLAYER_SPEED * deltaTime;
    if (holdS) playerPositionY += PLAYER_SPEED * deltaTime;
    if (holdA) playerPositionX -= PLAYER_SPEED * deltaTime;

    context.clearRect(0, 0, canvas.width, canvas.height);

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

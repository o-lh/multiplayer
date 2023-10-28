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

addEventListener('keydown', event => {
    if (event.repeat) return;

    switch (event.code) {
        case 'KeyW': holdW = true; break;
        case 'KeyA': holdA = true; break;
        case 'KeyS': holdS = true; break;
        case 'KeyD': holdD = true; break;
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
const PLAYER_COLOUR = 'rgb(255, 0, 0)';

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

    context.fillStyle = PLAYER_COLOUR;
    context.fillRect(playerPositionX - PLAYER_SIZE / 2, playerPositionY - PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE);

    requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

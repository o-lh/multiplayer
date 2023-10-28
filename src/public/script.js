const socket = io();

const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};

window.addEventListener('keydown', event => {
    if (!event.repeat) {
        switch (event.code) {
            case 'KeyW': console.log('W pressed'); break;
            case 'KeyA': console.log('A pressed'); break;
            case 'KeyS': console.log('S pressed'); break;
            case 'KeyD': console.log('D pressed'); break;
        }
    }
});

window.addEventListener('keyup', event => {
    switch (event.code) {
        case 'KeyW': console.log('W released'); break;
        case 'KeyA': console.log('A released'); break;
        case 'KeyS': console.log('S released'); break;
        case 'KeyD': console.log('D released'); break;
    }
});

const context = canvas.getContext('2d');
context.fillStyle = 'rgb(255, 0, 255)';

let prev = 0;
let delta = 0;

function tick(t) {
    delta = t - prev;
    prev = t;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillRect(t / 10, t / 10, 25, 25);

    requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

const socket = io();

const username = prompt('Enter your name:');
socket.emit('chat message', `${username} joined`);

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', `${username}: ${input.value}`);
        input.value = '';
    }
})

socket.on('chat message', (message) => {
    const item = document.createElement('li');
    item.textContent = message;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

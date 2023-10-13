import path from 'node:path';
import { fileURLToPath } from 'node:url';

import express from 'express';
import favicon from 'serve-favicon';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static('public'));

app.listen(1337, () => {
    console.log('Listening on port 1337');
});

// https://socket.io/docs/v4/tutorial/step-3

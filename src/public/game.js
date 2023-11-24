import { Vector2 } from "./vector2.js";

export class Game {
    // TODO: Begin the mess zone
    static socket = io();
    static CANVAS_WORLD_SPACE_WIDTH = 20;
    static CANVAS_WORLD_SPACE_HEIGHT = 20;
    /** @type {HTMLCanvasElement} */
    static canvas = document.getElementById('canvas');
    static context = Game.canvas.getContext('2d');
    static smallerDimension = innerWidth > innerHeight ? innerHeight : innerWidth;
    static PLAYER_RADIUS = 0.25;
    static playerRadiusScreenSpace;
    static mousePosition = new Vector2();
    static holdW = false;
    static holdA = false;
    static holdS = false;
    static holdD = false;
    static holdAttack = false;
    static ATTACK_INTERVAL = 0.2;
    static attackT = 0;
    static PLAYER_COLOURS = [
        'rgb(255, 0, 0)',
        'rgb(255, 128, 0)',
        'rgb(255, 255, 0)',
        'rgb(0, 255, 0)',
        'rgb(0, 128, 255)',
        'rgb(64, 0, 255)',
        'rgb(192, 0, 255)'
    ];
    static playerColour = 0;
    static hitsTaken = 0;

    static worldSpacePointToScreenSpace(point) {
        return new Vector2(
            Game.canvas.width / 2 + point.x * Game.canvas.width / Game.CANVAS_WORLD_SPACE_WIDTH,
            Game.canvas.height / 2 + point.y * Game.canvas.height / Game.CANVAS_WORLD_SPACE_HEIGHT
        );
    }

    // TODO: What about for a non-square canvas?
    static worldSpaceLengthToScreenSpace(length) {
        return length * Game.canvas.height / Game.CANVAS_WORLD_SPACE_HEIGHT;
    }

    static screenSpacePointToWorldSpace(point) {
        return new Vector2(
            point.x / Game.canvas.width * Game.CANVAS_WORLD_SPACE_WIDTH - Game.CANVAS_WORLD_SPACE_WIDTH / 2,
            point.y / Game.canvas.height * Game.CANVAS_WORLD_SPACE_HEIGHT - Game.CANVAS_WORLD_SPACE_HEIGHT / 2
        );
    }
    // TODO: End the mess zone

    static deltaTime = 0;
    static #prev = 0;

    static run() {
        Game.canvas.width = Game.smallerDimension;
        Game.canvas.height = Game.smallerDimension;

        Game.context.font = '20px sans-serif';
        Game.context.textAlign = 'center';

        Game.playerRadiusScreenSpace = Game.worldSpaceLengthToScreenSpace(Game.PLAYER_RADIUS);

        addEventListener('contextmenu', event => event.preventDefault());

        addEventListener('resize', _ => {
            Game.smallerDimension = innerWidth > innerHeight ? innerHeight : innerWidth;
            Game.canvas.width = Game.smallerDimension;
            Game.canvas.height = Game.smallerDimension;

            Game.context.font = '20px sans-serif';
            Game.context.textAlign = 'center';

            Game.playerRadiusScreenSpace = Game.worldSpaceLengthToScreenSpace(Game.PLAYER_RADIUS);
        });

        addEventListener('keydown', event => {
            if (event.repeat) return;
        
            switch (event.code) {
                case 'KeyW': Game.holdW = true; break;
                case 'KeyA': Game.holdA = true; break;
                case 'KeyS': Game.holdS = true; break;
                case 'KeyD': Game.holdD = true; break;
                case 'ArrowUp': Game.holdW = true; break;
                case 'ArrowLeft': Game.holdA = true; break;
                case 'ArrowDown': Game.holdS = true; break;
                case 'ArrowRight': Game.holdD = true; break;
                case 'Space': {
                    ++Game.playerColour;
                    if (Game.playerColour >= Game.PLAYER_COLOURS.length) Game.playerColour = 0;
                    Game.socket.emit('player_change_colour', Game.playerColour);
                    break;
                }
            }
        });
        
        addEventListener('keyup', event => {
            switch (event.code) {
                case 'KeyW': Game.holdW = false; break;
                case 'KeyA': Game.holdA = false; break;
                case 'KeyS': Game.holdS = false; break;
                case 'KeyD': Game.holdD = false; break;
                case 'ArrowUp': Game.holdW = false; break;
                case 'ArrowLeft': Game.holdA = false; break;
                case 'ArrowDown': Game.holdS = false; break;
                case 'ArrowRight': Game.holdD = false; break;
            }
        });
        
        addEventListener('mousedown', event => {
            if (event.button !== 0) return;
        
            Game.holdAttack = true;
            Game.mousePosition.x = event.x;
            Game.mousePosition.y = event.y;
        });
        
        addEventListener('mouseup', event => { if (event.button === 0) Game.holdAttack = false; });
        
        addEventListener('mousemove', event => {
            Game.mousePosition.x = event.x;
            Game.mousePosition.y = event.y;
        });

        // requestAnimationFrame(Game.#update);
    }

    static #update(t) {
        Game.deltaTime = (t - Game.#prev) / 1000;
        Game.#prev = t;

        requestAnimationFrame(Game.#update);
    }
}

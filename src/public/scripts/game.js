// TODO: import Engine?
import { Camera } from './camera.js';
import { Entity } from './entity.js';
import { Input } from './input.js';
import { Network } from './network.js';
import { Player } from './components/player.js';
import { Time } from './time.js';
import { Vector2 } from "./vector2.js";

export class Game {
    // TODO: Begin the mess zone
    static CANVAS_WORLD_SPACE_WIDTH = 20;
    static CANVAS_WORLD_SPACE_HEIGHT = 20;
    /** @type {HTMLCanvasElement} */
    static canvas = document.getElementById('canvas');
    static context = Game.canvas.getContext('2d');
    static smallerDimension = innerWidth > innerHeight ? innerHeight : innerWidth;
    static PLAYER_RADIUS = 0.25;
    /** @type {number} */
    static playerRadiusScreenSpace;
    /** @type {PlayerObject[]} */
    static otherPlayers = [];
    /** @type {Entity} */
    static player;
    // TODO: End the mess zone

    /** @type {function} */
    static #updateInput;

    /** @type {Entity[]} */
    static entities = [];

    /**
     * @param {Entity} entity
     */
    static addEntity() {
        return this.entities[this.entities.push(new Entity()) - 1];
    }

    static run() {
        Game.canvas.width = Game.smallerDimension;
        Game.canvas.height = Game.smallerDimension;

        Game.context.font = '20px sans-serif';
        Game.context.textAlign = 'center';

        Game.playerRadiusScreenSpace = Camera.worldSpaceLengthToScreenSpace(Game.PLAYER_RADIUS);

        addEventListener('contextmenu', event => event.preventDefault());

        addEventListener('resize', _ => {
            Game.smallerDimension = innerWidth > innerHeight ? innerHeight : innerWidth;
            Game.canvas.width = Game.smallerDimension;
            Game.canvas.height = Game.smallerDimension;

            Game.context.font = '20px sans-serif';
            Game.context.textAlign = 'center';

            Game.playerRadiusScreenSpace = Camera.worldSpaceLengthToScreenSpace(Game.PLAYER_RADIUS);
        });

        Network.init();
        this.#updateInput = Input.init();

        // TODO: Where should this belong?
        Network.socket.on('connected', () => {
            this.player = this.addEntity();
            this.player.addComponent(Player).init();
            this.player.position = new Vector2(
                (Math.random() * this.CANVAS_WORLD_SPACE_WIDTH) - this.CANVAS_WORLD_SPACE_WIDTH / 2,
                (Math.random() * this.CANVAS_WORLD_SPACE_HEIGHT) - this.CANVAS_WORLD_SPACE_HEIGHT / 2
            );

            // Set the player's initial position on the server
            Network.socket.emit('player_move', Game.player.position);
            Network.socket.emit(
                'create_entity',
                JSON.stringify(structuredClone(Game.player), (key, value) => {
                    if (key === 'components') for (const component of value) {
                        delete component.entity;
                    }

                    return value;
                }),
                true
            );

            requestAnimationFrame(this.#update);
        });
    }

    /**
     * @param {DOMHighResTimeStamp} time
     */
    static #update(time) {
        Time.tick(time);
        Game.#updateInput();

        for (const entity of Game.entities) {
            for (const component of entity.components) {
                component.update();
            }
        }

        for (let i = Game.entities.length - 1; i >= 0; --i) {
            if (Game.entities[i].destroyed) {
                Game.entities.splice(i, 1);
            }
        }

        Network.socket.emit('player_move', Game.player.position);

        Game.context.clearRect(0, 0, Game.canvas.width, Game.canvas.height);

        for (const entity of Game.entities) {
            for (const component of entity.components) {
                component.render();
            }
        }

        for (const player of Game.otherPlayers) {
            const playerPos = Camera.worldSpacePointToScreenSpace(player.position);

            Game.context.beginPath();
            Game.context.arc(playerPos.x, playerPos.y, Game.playerRadiusScreenSpace, 0, 2 * Math.PI, false);
            Game.context.fillStyle = 'rgb(255, 0, 0)';
            Game.context.fill();
        }

        for (const player of Game.otherPlayers) {
            const playerPos = Camera.worldSpacePointToScreenSpace(player.position);
            Game.context.fillStyle = 'rgb(255, 0, 0)';
            Game.context.fillText(player.hitsTaken, playerPos.x, playerPos.y - Game.playerRadiusScreenSpace - 5);
        }

        // TODO: Untie game logic from frame rate
        requestAnimationFrame(Game.#update);
    }
}

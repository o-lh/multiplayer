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
    /** @type {Entity} */
    static player;
    // TODO: End the mess zone

    /** @type {function} */
    static #updateInput;

    // TODO: ECS World class?
    /** @type {Entity[]} */
    static entities = [];

    /**
     * @param {string} [id]
     * @param {string} [owner]
     * @returns {Entity}
     */
    static addEntity(id, owner) {
        return this.entities[this.entities.push(new Entity(id, owner)) - 1];
    }

    // TODO: destroyEntity method

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
            Network.createEntity(Game.player, true);

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

        // TODO: Untie game logic from frame rate
        requestAnimationFrame(Game.#update);
    }
}

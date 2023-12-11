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
    static PLAYER_RADIUS = 0.25;

    static setCanvasProperties() {
        this.canvas.width = innerWidth > innerHeight ? innerHeight : innerWidth;
        this.canvas.height = innerWidth > innerHeight ? innerHeight : innerWidth;
        this.context.font = '20px sans-serif';
        this.context.textAlign = 'center';
    }
    // TODO: End the mess zone

    /** @type {() => void} */
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

    /**
     * @param {string} id
     */
    static getEntity(id) {
        return this.entities[this.entities.findIndex(x => x.id === id)];
    }

    static run() {
        this.setCanvasProperties();

        addEventListener('resize', (_) => this.setCanvasProperties());

        this.#updateInput = Input.init();
        Network.init();
        Network.waitForConnection(this.#start);
    }

    static #start() {
        const player = Game.addEntity();
        player.addComponent(Player).init();
        player.position = new Vector2(
            (Math.random() * Game.CANVAS_WORLD_SPACE_WIDTH) - Game.CANVAS_WORLD_SPACE_WIDTH / 2,
            (Math.random() * Game.CANVAS_WORLD_SPACE_HEIGHT) - Game.CANVAS_WORLD_SPACE_HEIGHT / 2
        );

        Network.createEntity(player, true);

        requestAnimationFrame(Game.#update);
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

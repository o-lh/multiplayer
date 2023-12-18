import { Entity } from './entity.js';
import { Input } from './input.js';
import { Network } from './network.js';
import { Player } from './components/player.js';
import { Renderer } from './renderer.js';
import { Time } from './time.js';
import { Vector2 } from "./vector2.js";
import { WallCreator } from './components/wall-creator.js';

export class Game {
    // TODO: Scene class
    static SCENE_SIZE = new Vector2(20, 20);

    /** @type {Entity[]} */
    static entities = [];

    /** @type {() => void} */
    static #clearInput;

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
        this.#clearInput = Input.init();
        Renderer.init();
        Network.init();
        Network.waitForConnection(this.#start);
    }

    static #start() {
        const player = Game.addEntity();
        player.addComponent(Player).init();
        player.position = new Vector2(
            (Math.random() * Game.SCENE_SIZE.x) - Game.SCENE_SIZE.x / 2,
            (Math.random() * Game.SCENE_SIZE.y) - Game.SCENE_SIZE.y / 2
        );

        Network.emit('create_entity', player, true);

        Game.addEntity().addComponent(WallCreator).init();

        requestAnimationFrame(Game.#update);
    }

    /**
     * @param {DOMHighResTimeStamp} time
     */
    static #update(time) {
        // TODO: Game.#updateTime(time);
        // TODO: google javascript singleton (does it just need an #initialised property?)
        Time.tick(time);

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

        Renderer.renderScene(Game.entities);

        Game.#clearInput();

        // TODO: Untie game logic from frame rate
        requestAnimationFrame(Game.#update);
    }
}

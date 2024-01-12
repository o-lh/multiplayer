import { Entity } from './entity.js';
import { Input } from './input.js';
import { Network } from './network.js';
import { Player } from './components/player.js';
import { Renderer } from './renderer.js';
import { Time } from './time.js';
import { Vector2 } from './vector2.js';
import { createWall } from './custom-entities/wall.js';

export class Game {
    // TODO: Scene class
    static SCENE_SIZE = new Vector2(20, 20);

    // TODO: What to do with this array? Put it on a component? Eh
    static walls = [];

    /** @type {Entity[]} */
    static entities = [];

    /** @type {() => void} */
    static #clearInput;

    /**
     * @param {string} id
     * @param {string} owner
     * @returns {Entity}
     */
    static addEntity(id = null, owner = null) {
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
        player.addTag('Player');
        player.position = new Vector2(
            (Math.random() * Game.SCENE_SIZE.x) - Game.SCENE_SIZE.x / 2,
            (Math.random() * Game.SCENE_SIZE.y) - Game.SCENE_SIZE.y / 2
        );
        player.addComponent(Player);

        Network.emit('create_entity', player, true);

        const unit = 10 / 3.5;

        createWall(new Vector2(10-unit, -10), new Vector2(10-unit, -10+3*unit));
        createWall(new Vector2(-10+unit, -10+unit), new Vector2(10-2*unit, -10+unit));
        createWall(new Vector2(10-2*unit, -10+unit), new Vector2(10-2*unit, 10-2*unit));
        createWall(new Vector2(-10+2*unit, -10+2*unit), new Vector2(-10+2*unit, 10-unit));
        createWall(new Vector2(-10+unit, 0), new Vector2(-10+unit, 10-unit));
        createWall(new Vector2(0, 10-2*unit), new Vector2(10-unit, 10-2*unit));
        createWall(new Vector2(-10+2*unit, 10-unit), new Vector2(10-2*unit, 10-unit));

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
                if (!entity.destroyed) component.render();
            }
        }

        for (let i = Game.entities.length - 1; i >= 0; --i) {
            if (Game.entities[i].destroyed) {
                Game.entities.splice(i, 1);
            }
        }

        Renderer.renderScene();

        Game.#clearInput();

        // TODO: Untie game logic from frame rate
        requestAnimationFrame(Game.#update);
    }
}

import { Entity } from './entity.js';
import { Health } from './components/health.js';
import { Input } from './input.js';
import { Network } from './network.js';
import { PhysicsBody } from './components/physics-body.js';
import { Player } from './components/player.js';
import { Renderer } from './renderer.js';
import { Time } from './time.js';
import { Vector2 } from './vector2.js';
import { createWall } from './custom-entities/wall.js';
import { createWallAlternating } from './custom-entities/wall-alternating.js'
import { createWallInvisible } from './custom-entities/wall-invisible.js';

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

        player.position = new Vector2(0, 0);

        player.addComponent(PhysicsBody);
    
        player.addComponent(Player);

        Network.emit('create_entity', player, true);

        createWall(new Vector2(-10, -3), new Vector2(-9, 1));
        createWall(new Vector2(-9, 1), new Vector2(-6, 2));
        createWall(new Vector2(-6, 2), new Vector2(-4, 3));
        createWall(new Vector2(-4, 3), new Vector2(-2, 2));
        createWall(new Vector2(-2, 2), new Vector2(2, 2));
        createWall(new Vector2(2, 2), new Vector2(4, 1));
        createWall(new Vector2(4, 1), new Vector2(5, 1));
        createWall(new Vector2(5, 1), new Vector2(6, 3));
        createWall(new Vector2(6, 3), new Vector2(9, 5));
        createWall(new Vector2(9, 5), new Vector2(10, 2));

        requestAnimationFrame(Game.#update);
    }

    static throttle = 0;

    /**
     * @param {DOMHighResTimeStamp} time
     */
    static #update(time) {
        // Game.throttle += 1;
        // if (Game.throttle < 10) {
        //     requestAnimationFrame(Game.#update);
        //     return;
        // }
        // Game.throttle = 0;

        // TODO: Game.#updateTime(time);
        // TODO: google javascript singleton (does it just need an #initialised property?)
        Time.tick(time);

        for (const entity of Game.entities) {
            for (const component of entity.components) {
                if (!component.enabled) continue;

                component.update();
                // TODO: What if this entity is destroyed later in the frame by another entity? Just do update and render loops separately
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

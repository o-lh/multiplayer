import { Entity } from './entity.js';
import { Input } from './input.js';
import { Network } from './network.js';
import { Player } from './components/player.js';
import { Renderer } from './renderer.js';
import { Time } from './time.js';
import { Vector2 } from './vector2.js';
import { Wall } from './components/wall.js';

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

        const wall1Entity = Game.addEntity();
        wall1Entity.addTag('Wall');
        const wall1 = wall1Entity.addComponent(Wall);
        wall1.startPoint = new Vector2(10-unit, -10);
        wall1.endPoint = new Vector2(10-unit, -10+3*unit);

        const wall2Entity = Game.addEntity();
        wall2Entity.addTag('Wall');
        const wall2 = wall2Entity.addComponent(Wall);
        wall2.startPoint = new Vector2(-10+unit, -10+unit);
        wall2.endPoint = new Vector2(10-2*unit, -10+unit);

        const wall3Entity = Game.addEntity();
        wall3Entity.addTag('Wall');
        const wall3 = wall3Entity.addComponent(Wall);
        wall3.startPoint = new Vector2(10-2*unit, -10+unit);
        wall3.endPoint = new Vector2(10-2*unit, 10-2*unit);

        const wall4Entity = Game.addEntity();
        wall4Entity.addTag('Wall');
        const wall4 = wall4Entity.addComponent(Wall);
        wall4.startPoint = new Vector2(-10+2*unit, -10+2*unit);
        wall4.endPoint = new Vector2(-10+2*unit, 10-unit);

        const wall5Entity = Game.addEntity();
        wall5Entity.addTag('Wall');
        const wall5 = wall5Entity.addComponent(Wall);
        wall5.startPoint = new Vector2(-10+unit, 0);
        wall5.endPoint = new Vector2(-10+unit, 10-unit);

        const wall6Entity = Game.addEntity();
        wall6Entity.addTag('Wall');
        const wall6 = wall6Entity.addComponent(Wall);
        wall6.startPoint = new Vector2(0, 10-2*unit);
        wall6.endPoint = new Vector2(10-unit, 10-2*unit);

        const wall7Entity = Game.addEntity();
        wall7Entity.addTag('Wall');
        const wall7 = wall7Entity.addComponent(Wall);
        wall7.startPoint = new Vector2(-10+2*unit, 10-unit);
        wall7.endPoint = new Vector2(10-2*unit, 10-unit);

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

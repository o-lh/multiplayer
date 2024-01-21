import { Entity } from './entity.js';
import { Game } from './game.js';
import { Health } from './components/health.js';
import { Player } from './components/player.js';
import { Projectile } from './components/projectile.js';
import { Vector2 } from './vector2.js';

export class Network {
    static #socket = io();

    static #componentConstructors = { Projectile: Projectile, Player: Player, Health: Health };
    static #objectConstructors = { Vector2: Vector2 };

    /**
     * @returns {string}
     */
    static get socketID() {
        return this.#socket.id;
    }

    // TODO: Singleton
    static init() {
        this.#socket.on('create_entity', (serializedEntity) => {
            const entity = Game.addEntity(serializedEntity.id, serializedEntity.owner);

            this.#deserializeProperties(entity, serializedEntity, entity);

            for (const component of entity.components) {
                component.networkStart();
            }
        });

        this.#socket.on('move_entity', (id, newPosition) => {
            Game.getEntity(id).position = newPosition;
        });

        this.#socket.on('destroy_entity', (id) => {
            Game.getEntity(id).destroy();
        });

        this.#socket.on('projectile_hit', (projectileID, targetID, pointOfCollision) => {
            Game.getEntity(projectileID)?.getComponent(Projectile).collide(pointOfCollision);
            Game.getEntity(targetID).getComponent(Player).takeDamage();
        });
    }

    /**
     * @param {string} event
     */
    static subscribe(event, listener) {
        this.#socket.on(event, listener);
    }

    /**
     * @param {() => void} onConnection
     */
    static waitForConnection(onConnection) {
        this.#socket.on('connected', () => {
            this.#socket.removeAllListeners('connected');
            onConnection();
        });
    }

    /**
     * @param {string} message
     * @param {...any} params
     */
    static emit(message, ...params) {
        this.#socket.emit(message, ...params);
    }

    /**
     * @param {Entity} entity
     * @returns {boolean}
     */
    static owns(entity) {
        return entity.owner === this.socketID;
    }

    static #deserializeProperties(entity, serializedObject, deserializedObject) {
        for (const property in serializedObject) {
            if (typeof serializedObject[property] !== 'object') {
                deserializedObject[property] = serializedObject[property];
                continue;
            }

            if (Array.isArray(serializedObject[property])) {
                deserializedObject[property] = [];
            } else if (Object.hasOwn(
                this.#objectConstructors,
                serializedObject[property].constructorName
            )) {
                deserializedObject[property] = new this.#objectConstructors[
                    serializedObject[property].constructorName
                ]();
            } else {
                deserializedObject[property] = new this.#componentConstructors[
                    serializedObject[property].constructorName
                ]();
                deserializedObject[property].entity = entity;
            }

            this.#deserializeProperties(
                entity,
                serializedObject[property],
                deserializedObject[property]
            );
        }
    }
}

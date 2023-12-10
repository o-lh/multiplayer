import { Entity } from "./entity.js";
import { Game } from "./game.js";
import { Player } from "./components/player.js";
import { Projectile } from "./components/projectile.js";
import { Vector2 } from "./vector2.js";

export class Network {
    static #socket = io();

    // TODO: Separate into #componentConstructors and #objectConstructors
    static #constructors = { Vector2: Vector2, Projectile: Projectile, Player: Player };

    // TODO: Singleton
    static init() {
        this.#socket.on('create_entity', (serializedEntity) => {
            serializedEntity = JSON.parse(serializedEntity);

            const entity = Game.addEntity(serializedEntity.id, serializedEntity.owner);

            // TODO: Move this outside of this function (entity needs to be in scope)
            function deserializeProperties(serializedObject, deserializedObject) {
                for (const property in serializedObject) {
                    if (typeof serializedObject[property] === 'object') {
                        if (Array.isArray(serializedObject[property])) {
                            deserializedObject[property] = [];
                        } else {
                            deserializedObject[property] =
                                new Network.#constructors[serializedObject[property].constructorName]();

                            // TODO: This will need to be changed if any other non-component classes are added
                            if (deserializedObject[property].constructorName !== 'Vector2') {
                                deserializedObject[property].entity = entity;
                            }
                        }

                        deserializeProperties(
                            serializedObject[property],
                            deserializedObject[property]
                        );
                    } else {
                        deserializedObject[property] = serializedObject[property];
                    }
                }
            }

            deserializeProperties(serializedEntity, entity);
        });

        this.#socket.on('move_entity', (id, newPosition) => {
            Game.getEntity(id).position = newPosition;
        });

        this.#socket.on('destroy_entity', (id) => {
            Game.getEntity(id).destroy();
        });

        this.#socket.on('projectile_hit', (owner, projectileID, targetID) => {
            Game.entities[
                Game.entities.findIndex(x => x.owner === owner && x.id === projectileID)
            ].destroy();

            if (targetID === this.socketID) {
                ++Game.player.getComponent(Player).hitsTaken;
            } else {
                const index = Game.otherPlayers.findIndex(player => player.id === targetID);
                ++Game.otherPlayers[index].hitsTaken;
            }
        });
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
     * @param {boolean} saveToServer
     */
    static createEntity(entity, saveToServer) {
        // TODO: You don't actually need to stringify the object before emitting it
        // TODO: Therefore this can also be done using Network.emit
        this.#socket.emit(
            'create_entity',
            JSON.stringify(entity),
            saveToServer
        );
    }

    /**
     * @param {Entity} entity
     * @returns {boolean}
     */
    static owns(entity) {
        return entity.owner === this.socketID;
    }

    /**
     * @returns {string}
     */
    static get socketID() {
        return this.#socket.id;
    }
}

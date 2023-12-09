import { Game } from "./game.js";
import { Player } from "./components/player.js";
import { Projectile } from "./components/projectile.js";
import { Vector2 } from "./vector2.js";

export class Network {
    // TODO: Private
    static socket = io();

    // TODO: Separate into #componentConstructors and #objectConstructors
    static #constructors = { Vector2: Vector2, Projectile: Projectile, Player: Player };

    // TODO: Singleton
    static init() {
        Network.socket.on('player_connected', newPlayer => {
            Game.otherPlayers.push(newPlayer);
        });

        Network.socket.on('player_move', (id, position) => {
            const index = Game.otherPlayers.findIndex(player => player.id === id);
            Game.otherPlayers[index].position = position;
        });

        Network.socket.on('create_entity', serializedEntity => {
            serializedEntity = JSON.parse(serializedEntity);

            const entity = Game.addEntity();

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

        Network.socket.on('projectile_hit', (projectileID, targetID) => {
            Game.entities[Game.entities.findIndex(x => x.id === projectileID)].destroyed = true;

            if (targetID === Network.socketID) {
                ++Game.player.getComponent(Player).hitsTaken;
            } else {
                const index = Game.otherPlayers.findIndex(player => player.id === targetID);
                ++Game.otherPlayers[index].hitsTaken;
            }
        });

        Network.socket.on('player_disconnected', id => {
            const index = Game.otherPlayers.findIndex(player => player.id === id);
            Game.otherPlayers.splice(index, 1);
        });
    }

    /**
     * @returns {string}
     */
    static get socketID() {
        return this.socket.id;
    }
}

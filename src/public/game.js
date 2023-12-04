// TODO: import Engine?
import { Entity } from './entity.js';
import { Player } from './components/player.js';
import { Projectile } from "./components/projectile.js";
import { Time } from './time.js';
import { Vector2 } from "./vector2.js";
import { Input } from './input.js';

export class Game {
    // TODO: Begin the mess zone
    static socket = io();
    static CANVAS_WORLD_SPACE_WIDTH = 20;
    static CANVAS_WORLD_SPACE_HEIGHT = 20;
    /** @type {HTMLCanvasElement} */
    static canvas = document.getElementById('canvas');
    static context = Game.canvas.getContext('2d');
    static smallerDimension = innerWidth > innerHeight ? innerHeight : innerWidth;
    static PLAYER_RADIUS = 0.25;
    /** @type {number} */
    static playerRadiusScreenSpace;
    static ATTACK_INTERVAL = 0.2;
    static attackT = 0;
    static hitsTaken = 0;
    /** @type {PlayerObject[]} */
    static otherPlayers = [];
    /** @type {Projectile[]} */
    static projectiles = [];
    static PLAYER_SPEED = 4;
    /** @type {Entity} */
    static player;

    static worldSpacePointToScreenSpace(point) {
        return new Vector2(
            Game.canvas.width / 2 + point.x * Game.canvas.width / Game.CANVAS_WORLD_SPACE_WIDTH,
            Game.canvas.height / 2 + point.y * Game.canvas.height / Game.CANVAS_WORLD_SPACE_HEIGHT
        );
    }

    // TODO: What about for a non-square canvas?
    static worldSpaceLengthToScreenSpace(length) {
        return length * Game.canvas.height / Game.CANVAS_WORLD_SPACE_HEIGHT;
    }

    static screenSpacePointToWorldSpace(point) {
        return new Vector2(
            point.x / Game.canvas.width * Game.CANVAS_WORLD_SPACE_WIDTH - Game.CANVAS_WORLD_SPACE_WIDTH / 2,
            point.y / Game.canvas.height * Game.CANVAS_WORLD_SPACE_HEIGHT - Game.CANVAS_WORLD_SPACE_HEIGHT / 2
        );
    }
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

        Game.playerRadiusScreenSpace = Game.worldSpaceLengthToScreenSpace(Game.PLAYER_RADIUS);

        addEventListener('contextmenu', event => event.preventDefault());

        addEventListener('resize', _ => {
            Game.smallerDimension = innerWidth > innerHeight ? innerHeight : innerWidth;
            Game.canvas.width = Game.smallerDimension;
            Game.canvas.height = Game.smallerDimension;

            Game.context.font = '20px sans-serif';
            Game.context.textAlign = 'center';

            Game.playerRadiusScreenSpace = Game.worldSpaceLengthToScreenSpace(Game.PLAYER_RADIUS);
        });

        this.#updateInput = Input.init();

        Game.socket.on('player_connected', newPlayer => {
            Game.otherPlayers.push(newPlayer);
        });

        Game.socket.on('player_move', (id, position) => {
            const index = Game.otherPlayers.findIndex(player => player.id === id);
            Game.otherPlayers[index].position = position;
        });

        Game.socket.on('create_entity', serializedEntity => {
            serializedEntity = JSON.parse(serializedEntity);

            const entity = Game.addEntity();

            // TODO: Move these... somewhere
            // TODO: But deserializeProperties requires entity in scope to add it to components
            const lookup = { Vector2: Vector2, Projectile: Projectile };

            function deserializeProperties(serializedObject, deserializedObject) {
                for (const property in serializedObject) {
                    if (typeof serializedObject[property] === 'object') {
                        if (Array.isArray(serializedObject[property])) {
                            deserializedObject[property] = [];
                        } else {
                            deserializedObject[property] =
                                new lookup[serializedObject[property].constructorName]();

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

            // TODO: Remove later
            Game.projectiles.unshift(entity.getComponent(Projectile));
        });

        Game.socket.on('projectile_hit', (projectileID, targetID) => {
            const projectileIndex = Game.projectiles.findIndex(projectile => projectile.id === projectileID);
            Game.projectiles[projectileIndex].destroyed = true;

            if (targetID === Game.socket.id) {
                ++Game.hitsTaken;
            } else {
                const index = Game.otherPlayers.findIndex(player => player.id === targetID);
                ++Game.otherPlayers[index].hitsTaken;
            }
        });

        Game.socket.on('player_disconnected', id => {
            const index = Game.otherPlayers.findIndex(player => player.id === id);
            Game.otherPlayers.splice(index, 1);
        });

        this.player = this.addEntity();
        this.player.addComponent(Player).init();
        this.player.position = new Vector2(
            (Math.random() * this.CANVAS_WORLD_SPACE_WIDTH) - this.CANVAS_WORLD_SPACE_WIDTH / 2,
            (Math.random() * this.CANVAS_WORLD_SPACE_HEIGHT) - this.CANVAS_WORLD_SPACE_HEIGHT / 2
        );

        // Set the player's initial position on the server
        Game.socket.emit('player_move', Game.player.position);

        // TODO: socket.id is undefined initially. Perhaps only start once it is defined?
        requestAnimationFrame(this.#update);
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

        if (Input.keyHeld('KeyW') || Input.keyHeld('ArrowUp'))
            Game.player.position.y -= Game.PLAYER_SPEED * Time.deltaTime;
        if (Input.keyHeld('KeyD') || Input.keyHeld('ArrowRight'))
            Game.player.position.x += Game.PLAYER_SPEED * Time.deltaTime;
        if (Input.keyHeld('KeyS') || Input.keyHeld('ArrowDown'))
            Game.player.position.y += Game.PLAYER_SPEED * Time.deltaTime;
        if (Input.keyHeld('KeyA') || Input.keyHeld('ArrowLeft'))
            Game.player.position.x -= Game.PLAYER_SPEED * Time.deltaTime;

        if (Game.player.position.y - Game.PLAYER_RADIUS < -Game.CANVAS_WORLD_SPACE_HEIGHT / 2)
            Game.player.position.y = -Game.CANVAS_WORLD_SPACE_HEIGHT / 2 + Game.PLAYER_RADIUS;
        if (Game.player.position.x + Game.PLAYER_RADIUS > Game.CANVAS_WORLD_SPACE_WIDTH / 2)
            Game.player.position.x = Game.CANVAS_WORLD_SPACE_WIDTH / 2 - Game.PLAYER_RADIUS;
        if (Game.player.position.y + Game.PLAYER_RADIUS > Game.CANVAS_WORLD_SPACE_HEIGHT / 2)
            Game.player.position.y = Game.CANVAS_WORLD_SPACE_HEIGHT / 2 - Game.PLAYER_RADIUS;
        if (Game.player.position.x - Game.PLAYER_RADIUS < -Game.CANVAS_WORLD_SPACE_WIDTH / 2)
            Game.player.position.x = -Game.CANVAS_WORLD_SPACE_WIDTH / 2 + Game.PLAYER_RADIUS;

        if (Input.mouseHeld(0)) {
            if (Game.attackT <= 0) {
                const clickPosition = Game.screenSpacePointToWorldSpace(
                    new Vector2(
                        Input.mousePosition.x - Game.canvas.offsetLeft,
                        Input.mousePosition.y - Game.canvas.offsetTop
                    )
                );

                const direction = Vector2.subtract(clickPosition, Game.player.position).normalized;

                const entity = Game.addEntity();

                entity.addComponent(Projectile).init(
                    Game.socket.id,
                    Vector2.add(
                        structuredClone(Game.player.position),
                        Vector2.multiplyScalar(direction, Game.PLAYER_RADIUS)
                    ),
                    direction,
                    50
                );

                // TODO: CreateNetworkObject function?
                Game.projectiles.unshift(entity.getComponent(Projectile));

                Game.socket.emit('create_entity',
                    JSON.stringify(structuredClone(entity), (key, value) => {
                        if (key === '') delete value.destroyed;

                        if (key === 'components') for (const component of value) {
                            delete component.entity;
                        }

                        return value;
                    })
                );

                Game.attackT += Game.ATTACK_INTERVAL;
            }
        }

        Game.socket.emit('player_move', Game.player.position);

        Game.context.clearRect(0, 0, Game.canvas.width, Game.canvas.height);

        for (const entity of Game.entities) {
            for (const component of entity.components) {
                component.render();
            }
        }

        for (const player of Game.otherPlayers) {
            const playerPos = Game.worldSpacePointToScreenSpace(player.position);

            Game.context.beginPath();
            Game.context.arc(playerPos.x, playerPos.y, Game.playerRadiusScreenSpace, 0, 2 * Math.PI, false);
            Game.context.fillStyle = 'rgb(255, 0, 0)';
            Game.context.fill();
        }

        const playerPos = Game.worldSpacePointToScreenSpace(Game.player.position);

        Game.context.beginPath();
        Game.context.arc(playerPos.x, playerPos.y, Game.playerRadiusScreenSpace, 0, 2 * Math.PI, false);
        Game.context.fillStyle = 'rgb(0, 255, 0)';
        Game.context.fill();

        for (const player of Game.otherPlayers) {
            const playerPos = Game.worldSpacePointToScreenSpace(player.position);
            Game.context.fillStyle = 'rgb(255, 0, 0)';
            Game.context.fillText(player.hitsTaken, playerPos.x, playerPos.y - Game.playerRadiusScreenSpace - 5);
        }

        Game.context.fillStyle = 'rgb(0, 255, 0)';
        Game.context.fillText(Game.hitsTaken, playerPos.x, playerPos.y - Game.playerRadiusScreenSpace - 5);

        Game.attackT -= Time.deltaTime;
        if (Game.attackT < 0) Game.attackT = 0;

        // TODO: Untie game logic from frame rate
        requestAnimationFrame(Game.#update);
    }
}

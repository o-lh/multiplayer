import { Camera } from "../camera.js";
import { Component } from "../component.js";
import { Game } from "../game.js";
import { Input } from "../input.js";
import { Network } from "../network.js";
import { Projectile } from "./projectile.js";
import { Time } from "../time.js";
import { Vector2 } from "../vector2.js";

export class Player extends Component {
    init() {
        this.speed = 4;
        this.attackInterval = 0.2;
        this.attackT = 0;
        this.hitsTaken = 0;
    }

    update() {
        if (Input.keyHeld('KeyW') || Input.keyHeld('ArrowUp'))
            this.entity.position.y -= this.speed * Time.deltaTime;
        if (Input.keyHeld('KeyD') || Input.keyHeld('ArrowRight'))
            this.entity.position.x += this.speed * Time.deltaTime;
        if (Input.keyHeld('KeyS') || Input.keyHeld('ArrowDown'))
            this.entity.position.y += this.speed * Time.deltaTime;
        if (Input.keyHeld('KeyA') || Input.keyHeld('ArrowLeft'))
            this.entity.position.x -= this.speed * Time.deltaTime;

        if (this.entity.position.y - Game.PLAYER_RADIUS < -Game.CANVAS_WORLD_SPACE_HEIGHT / 2)
            this.entity.position.y = -Game.CANVAS_WORLD_SPACE_HEIGHT / 2 + Game.PLAYER_RADIUS;
        if (this.entity.position.x + Game.PLAYER_RADIUS > Game.CANVAS_WORLD_SPACE_WIDTH / 2)
            this.entity.position.x = Game.CANVAS_WORLD_SPACE_WIDTH / 2 - Game.PLAYER_RADIUS;
        if (this.entity.position.y + Game.PLAYER_RADIUS > Game.CANVAS_WORLD_SPACE_HEIGHT / 2)
            this.entity.position.y = Game.CANVAS_WORLD_SPACE_HEIGHT / 2 - Game.PLAYER_RADIUS;
        if (this.entity.position.x - Game.PLAYER_RADIUS < -Game.CANVAS_WORLD_SPACE_WIDTH / 2)
            this.entity.position.x = -Game.CANVAS_WORLD_SPACE_WIDTH / 2 + Game.PLAYER_RADIUS;

        if (Input.mouseHeld(0)) {
            if (this.attackT <= 0) {
                const clickPosition = Camera.screenSpacePointToWorldSpace(
                    new Vector2(
                        Input.mousePosition.x - Game.canvas.offsetLeft,
                        Input.mousePosition.y - Game.canvas.offsetTop
                    )
                );

                const direction = Vector2.subtract(clickPosition, this.entity.position).normalized;

                const entity = Game.addEntity();

                entity.addComponent(Projectile).init(
                    Network.socketID,
                    Vector2.add(
                        structuredClone(this.entity.position),
                        Vector2.multiplyScalar(direction, Game.PLAYER_RADIUS)
                    ),
                    direction,
                    50
                );

                // TODO: CreateNetworkObject function?
                Network.socket.emit(
                    'create_entity',
                    JSON.stringify(structuredClone(entity), (key, value) => {
                        if (key === '') delete value.destroyed;

                        if (key === 'components') for (const component of value) {
                            delete component.entity;
                        }

                        return value;
                    }),
                    false
                );

                this.attackT += this.attackInterval;
            }
        }

        this.attackT -= Time.deltaTime;
        if (this.attackT < 0) this.attackT = 0;
    }

    render() {
        const playerPos = Camera.worldSpacePointToScreenSpace(this.entity.position);

        Game.context.beginPath();
        Game.context.arc(playerPos.x, playerPos.y, Game.playerRadiusScreenSpace, 0, 2 * Math.PI, false);
        Game.context.fillStyle = 'rgb(0, 255, 0)';
        Game.context.fill();

        Game.context.fillStyle = 'rgb(0, 255, 0)';
        Game.context.fillText(this.hitsTaken, playerPos.x, playerPos.y - Game.playerRadiusScreenSpace - 5);
    }
}

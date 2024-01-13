import { Component } from '../component.js';
import { Game } from '../game.js';
import { Input } from '../input.js';
import { Network } from '../network.js';
import { Physics } from '../physics.js';
import { Projectile } from './projectile.js';
import { Renderer } from '../renderer.js';
import { Shape } from '../shape.js';
import { Time } from '../time.js';
import { Vector2 } from '../vector2.js';
import { Wall } from './wall.js';

export class Player extends Component {
    size = 0.25;
    speed = 4;
    attackInterval = 0.2;
    attackT = 0;
    #hitsTaken = 0;

    update() {
        if (!Network.owns(this.entity)) return;

        if (Input.keyHeld('KeyW') || Input.keyHeld('ArrowUp'))
            this.entity.position.y -= this.speed * Time.deltaTime;
        if (Input.keyHeld('KeyD') || Input.keyHeld('ArrowRight'))
            this.entity.position.x += this.speed * Time.deltaTime;
        if (Input.keyHeld('KeyS') || Input.keyHeld('ArrowDown'))
            this.entity.position.y += this.speed * Time.deltaTime;
        if (Input.keyHeld('KeyA') || Input.keyHeld('ArrowLeft'))
            this.entity.position.x -= this.speed * Time.deltaTime;

        if (this.entity.position.y - this.size < -Game.SCENE_SIZE.y / 2)
            this.entity.position.y = -Game.SCENE_SIZE.y / 2 + this.size;
        if (this.entity.position.x + this.size > Game.SCENE_SIZE.x / 2)
            this.entity.position.x = Game.SCENE_SIZE.x / 2 - this.size;
        if (this.entity.position.y + this.size > Game.SCENE_SIZE.y / 2)
            this.entity.position.y = Game.SCENE_SIZE.y / 2 - this.size;
        if (this.entity.position.x - this.size < -Game.SCENE_SIZE.x / 2)
            this.entity.position.x = -Game.SCENE_SIZE.x / 2 + this.size;

        // TODO: Spatial partitioning
        for (const entity of Game.entities) {
            if (!entity.hasTag('Wall')) continue;

            const wall = entity.getComponent(Wall);

            const collision = Physics.lineCircleCollision(
                wall.startPoint,
                wall.endPoint,
                this.entity.position,
                this.size
            );

            if (collision) {
                const relativeToCollision = Vector2.subtract(this.entity.position, collision);
                this.entity.position = Vector2.add(
                    collision,
                    Vector2.multiplyScalar(
                        relativeToCollision.normalized,
                        this.size
                    )
                );
            }
        }

        Network.emit('move_entity', this.entity.id, this.entity.position);

        if (Input.mouseHeld(0)) {
            if (this.attackT <= 0) {
                const clickPosition = Input.mousePositionWorldSpace;

                const direction = Vector2.subtract(clickPosition, this.entity.position).normalized;

                const entity = Game.addEntity();

                entity.addComponent(Projectile).init(
                    Vector2.add(
                        structuredClone(this.entity.position),
                        Vector2.multiplyScalar(direction, this.size)
                    ),
                    direction
                );

                Network.emit('create_entity', entity, false);

                this.attackT += this.attackInterval;
            }
        }

        this.attackT -= Time.deltaTime;
        if (this.attackT < 0) this.attackT = 0;
    }

    render() {
        // TODO: Network.owns needs to be checked after being received over Socket.IO, but every frame is excessive
        const colour = Network.owns(this.entity) ? 'rgb(0, 255, 0)' : 'rgb(255, 0, 0)';

        Renderer.render(2, Shape.Circle, colour, this.entity.position, this.size);
        Renderer.render(
            4,
            Shape.Text,
            colour,
            this.#hitsTaken,
            new Vector2(this.entity.position.x, this.entity.position.y - this.size - 0.1)
        );
    }

    takeDamage() {
        ++this.#hitsTaken;
        if (Network.owns(this.entity))
            this.entity.position = new Vector2(
                (Math.random() * Game.SCENE_SIZE.x) - Game.SCENE_SIZE.x / 2,
                (Math.random() * Game.SCENE_SIZE.y) - Game.SCENE_SIZE.y / 2
            );
    }
}

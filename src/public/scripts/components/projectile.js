import { Component } from '../component.js';
import { Game } from '../game.js';
import { Wall } from './wall.js';
import { Network } from '../network.js';
import { Physics } from '../physics.js';
import { Player } from './player.js';
import { Renderer } from '../renderer.js';
import { Shape } from '../shape.js';
import { Time } from '../time.js';
import { Vector2 } from '../vector2.js';

export class Projectile extends Component {
    /**
     * @param {Vector2} origin
     * @param {Vector2} direction
     */
    init(origin, direction) {
        this.origin = origin;
        this.entity.position = origin;
        this.head = origin;
        this.tail = origin;
        this.direction = direction;
        this.speed = 50;
        this.collided = false;
    }

    update() {
        this.head = Vector2.add(
            this.head,
            Vector2.multiplyScalar(this.direction, this.speed * Time.deltaTime)
        );

        this.#setTailPosition();

        switch (this.collided) {
            case false: this.#stateTravelling(); break;
            case true: this.#stateCollided(); break;
        }
    }

    render() {
        Renderer.render(1, Shape.Line, 'rgb(255, 255, 255)', this.tail, this.entity.position);
    }

    collide(pointOfCollision) {
        this.collided = true;
        this.entity.position = pointOfCollision;
    }

    #setTailPosition() {
        // Set tail a fixed distance behind head
        this.tail = Vector2.subtract(
            this.head,
            Vector2.multiplyScalar(this.direction, 2)
        );

        // If tail is behind origin, set it to origin
        if (Vector2.dot(
            Vector2.subtract(this.head, this.tail),
            Vector2.subtract(this.origin, this.tail)
        ) > 0)
            this.tail = this.origin;
    }

    #stateTravelling() {
        this.entity.position = this.head;

        if (
            this.entity.position.y < -Game.SCENE_SIZE.y ||
            this.entity.position.x > Game.SCENE_SIZE.x ||
            this.entity.position.y > Game.SCENE_SIZE.y ||
            this.entity.position.x < -Game.SCENE_SIZE.x
        ) {
            this.entity.destroy();
        }

        // TODO: Spatial partitioning
        for (const entity of Game.entities) {
            if (!entity.hasTag('Wall')) continue;

            const wall = entity.getComponent(Wall);

            // TODO: Projectile's hitbox is just its movement this frame, not all of the tail
            const collision = Physics.lineLineCollision(
                this.tail,
                this.entity.position,
                wall.startPoint,
                wall.endPoint
            );

            if (collision.intersection) {
                // TODO: Emit network event
                this.collide(collision.intersection);
                return;
            }
        }

        if (!Network.owns(this.entity)) return;

        for (const entity of Game.entities) {
            if (!entity.hasTag('Player')) continue;
            if (Network.owns(entity)) continue;

            const collision = Physics.lineCircleCollision(
                this.tail,
                this.entity.position,
                entity.position,
                entity.getComponent(Player).size
            )
            
            if (!collision) continue;

            Network.emit('projectile_hit', this.entity.id, entity.id, collision);
            this.collide(collision);
            ++entity.getComponent(Player).hitsTaken;
        }
    }

    #stateCollided() {
        const t = Vector2.dot(
            this.direction,
            Vector2.subtract(this.entity.position, this.tail)
        );

        if (t <= 0) this.entity.destroy();
    }
}

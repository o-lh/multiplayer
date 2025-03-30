import { Component } from '../component.js';
import { Game } from '../game.js';
import { Input } from '../input.js';
import { LineCollider } from './line-collider.js';
import { Network } from '../network.js';
import { Physics } from '../physics.js';
import { PhysicsBody } from './physics-body.js';
import { Projectile } from './projectile.js';
import { Renderer } from '../renderer.js';
import { Shape } from '../shape.js';
import { Time } from '../time.js';
import { Vector2 } from '../vector2.js';

export class Player extends Component {
    physicsBody = this.entity.getComponent(PhysicsBody);
    size = 0.25;
    speed = 4;
    attackInterval = 0.2;
    attackT = 0;
    #colour;
    #hitsTaken = 0;

    start() {
        this.#colour = Network.owns(this.entity) ? 'rgb(0, 255, 0)' : 'rgb(255, 0, 0)';
    }

    networkStart() {
        this.#colour = Network.owns(this.entity) ? 'rgb(0, 255, 0)' : 'rgb(255, 0, 0)';
    }

    update() {
        if (!Network.owns(this.entity)) return;

        this.physicsBody.velocity.x = 0;

        if (Input.keyHeld('KeyA') && !Input.keyHeld('KeyD'))
            this.move(-this.speed);
        if (Input.keyHeld('KeyD') && !Input.keyHeld('KeyA'))
            this.move(this.speed);

        if (Input.keyPressed('KeyW')) {
            this.physicsBody.velocity.y = -0.1;
            this.physicsBody.airborne = true;
        }
        if (Input.keyPressed('KeyS')) {
            if (this.physicsBody.airborne) this.physicsBody.velocity.y = 1;
        }

        Network.emit('move_entity', this.entity.id, this.entity.position);

        this.attackT -= Time.deltaTime;
        if (this.attackT < 0) this.attackT = 0;
    }

    render() {
        Renderer.render(
            2,
            Shape.Circle,
            this.#colour,
            Vector2.subtract(
                this.entity.position,
                new Vector2(0, this.size)
            ),
            this.size
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

    move(step) {
        if (this.physicsBody.airborne) {
            this.physicsBody.velocity.x = step * Time.deltaTime;
            return;
        }

        const checkUp = new Vector2(step * Time.deltaTime, -Math.abs(step) * Time.deltaTime);
        const checkDown = new Vector2(0, Math.abs(2 * step) * Time.deltaTime);

        for (const entity of Game.entities) {
            if (!entity.hasTag('Wall')) continue;

            const wallCollider = entity.getComponent(LineCollider);

            if (!wallCollider.enabled) continue;

            const collisionUp = Physics.lineLineCollision(
                new Vector2(this.entity.position.x, this.entity.position.y + checkUp.y),
                Vector2.add(this.entity.position, checkUp),
                wallCollider.startPoint,
                wallCollider.endPoint
            );

            if (collisionUp.intersection &&
                (
                    collisionUp.intersection.x !== this.entity.position.x ||
                    collisionUp.intersection.y !== this.entity.position.y
                )
            ) {
                return;
            }

            const collisionDown = Physics.lineLineCollision(
                Vector2.add(this.entity.position, checkUp),
                Vector2.add(this.entity.position, checkUp, checkDown),
                wallCollider.startPoint,
                wallCollider.endPoint
            );

            if (collisionDown.intersection &&
                (
                    collisionDown.intersection.x !== this.entity.position.x ||
                    collisionDown.intersection.y !== this.entity.position.y
                )
            ) {
                this.entity.position = collisionDown.intersection;
                return;
            }
        }

        this.physicsBody.airborne = true;
    }
}

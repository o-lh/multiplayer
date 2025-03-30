import { Component } from '../component.js';
import { LineCollider } from './line-collider.js';
import { Physics } from '../physics.js';
import { Renderer } from '../renderer.js';
import { Shape } from '../shape.js';
import { Vector2 } from '../vector2.js';
import { Game } from '../game.js';

export class PhysicsBody extends Component {
    velocity = new Vector2();
    airborne = true;
    nextPosition = null;

    update() {
        this.nextPosition = Vector2.add(this.entity.position, this.velocity);
        if (this.airborne) this.applyGravity();
        this.entity.position = this.nextPosition;
    }
    
    applyGravity() {
        this.velocity.y += 0.002;

        for (const entity of Game.entities) {
            if (!entity.hasTag('Wall')) continue;

            const wallCollider = entity.getComponent(LineCollider);

            if (!wallCollider.enabled) continue;

            const collision = Physics.lineLineCollision(
                this.entity.position,
                this.nextPosition,
                wallCollider.startPoint,
                wallCollider.endPoint
            );

            if (collision.intersection) {
                // TODO: This feels like a bad idea - only used for the first frame of jumping
                if (collision.intersection.x === this.entity.position.x &&
                    collision.intersection.y === this.entity.position.y) return;

                this.nextPosition = collision.intersection;
                this.airborne = false;
                this.velocity.x = 0;
                this.velocity.y = 0;
            }
        }
    }
}

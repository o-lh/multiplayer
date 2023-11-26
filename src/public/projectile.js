import { Component } from "./component.js";
import { Vector2 } from "./vector2.js";

export class Projectile extends Component {
    /**
     * @param {string} id
     * @param {string} owner
     * @param {Vector2} origin
     * @param {Vector2} direction
     * @param {number} speed
     */
    constructor(id, owner, origin, direction, speed) {
        super();

        this.id = id;
        this.destroyed = false;
        this.owner = owner;
        this.origin = origin;
        this.direction = direction;
        this.speed = speed;
        this.head = origin;
        this.tail = origin;
    }

    /**
     * @param {number} deltaTime
     */
    update(deltaTime) {
        this.head = Vector2.add(
            this.head,
            Vector2.multiplyScalar(this.direction, this.speed * deltaTime)
        );

        // TODO: These boundaries are hard-coded
        if (this.tail.y < -10 || this.tail.x > 10 || this.tail.y > 10 || this.tail.x < -10) {
            this.destroyed = true;
            return;
        }

        this.tail = Vector2.subtract(
            this.head,
            Vector2.multiplyScalar(this.direction, 2)
        );

        if (this.#isTailPastOrigin()) this.tail = this.origin;
    }

    #isTailPastOrigin() {
        const sqrToTail = Vector2.subtract(this.head, this.tail).sqrMagnitude;
        const sqrToOrigin = Vector2.subtract(this.head, this.origin).sqrMagnitude;

        return sqrToTail > sqrToOrigin;
    }
}

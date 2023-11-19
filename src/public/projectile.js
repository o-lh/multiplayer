import { Vector2 } from "./vector2.js";

export class Projectile {
    /**
     * @param {string} id
     * @param {string} owner
     * @param {Vector2} origin
     * @param {Vector2} direction
     * @param {number} speed
     * @param {Vector2} head
     * @param {Vector2} tail
     */
    constructor(id, owner, origin, direction, speed, head, tail) {
        this.id = id;
        this.destroyed = false;
        this.owner = owner;
        this.origin = origin;
        this.direction = direction;
        this.speed = speed;
        this.head = head;
        this.tail = tail;
    }

    /**
     * @param {number} deltaTime
     */
    update(deltaTime) {
        this.head = Vector2.add(
            this.head,
            Vector2.multiplyScalar(this.direction, this.speed / 5 * deltaTime)
        );

        // TODO: These boundaries are hard-coded
        if (this.head.y < -20 || this.head.x > 20 || this.head.y > 20 || this.head.x < -20) {
            this.destroyed = true;
            return;
        }

        this.tail = Vector2.subtract(
            this.head,
            Vector2.multiplyScalar(this.direction, 10)
        );

        if (this.#isTailPastOrigin()) this.tail = this.origin;
    }

    #isTailPastOrigin() {
        const sqrToTail = Vector2.subtract(this.head, this.tail).sqrMagnitude;
        const sqrToOrigin = Vector2.subtract(this.head, this.origin).sqrMagnitude;

        return sqrToTail > sqrToOrigin;
    }
}

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
        this.owner = owner;
        this.origin = origin;
        this.direction = direction;
        this.speed = speed;
        this.head = head;
        this.tail = tail;
    }
}

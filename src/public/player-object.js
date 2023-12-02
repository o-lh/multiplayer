export class PlayerObject {
    /**
     * @param {string} id
     * @param {Vector2} position
     * @param {number} colour
     */
    constructor(id, position, colour) {
        this.id = id;
        this.position = position;
        this.colour = colour;
        this.hitsTaken = 0;
    }
}

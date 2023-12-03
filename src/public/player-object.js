export class PlayerObject {
    /**
     * @param {string} id
     * @param {Vector2} position
     */
    constructor(id, position) {
        this.id = id;
        this.position = position;
        this.hitsTaken = 0;
    }
}

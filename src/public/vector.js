export class Vector2 {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * @param {Vector2[]} vectors
     */
    static add(...vectors) {
        return vectors.reduce((previousValue, currentValue) =>
            new Vector2(previousValue.x + currentValue.x, previousValue.y + currentValue.y)
        );
    }

    /**
     * @param {Vector2[]} vectors
     */
    static subtract(...vectors) {
        return vectors.reduce((previousValue, currentValue) =>
            new Vector2(previousValue.x - currentValue.x, previousValue.y - currentValue.y)
        );
    }

    /**
     * @param {Vector2[]} vectors
     */
    static multiply(...vectors) {
        return vectors.reduce((previousValue, currentValue) =>
            new Vector2(previousValue.x * currentValue.x, previousValue.y * currentValue.y)
        );
    }

    /**
     * @param {Vector2[]} vectors
     */
    static divide(...vectors) {
        return vectors.reduce((previousValue, currentValue) =>
            new Vector2(previousValue.x / currentValue.x, previousValue.y / currentValue.y)
        );
    }

    get magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    get normalized() {
        const magnitude = this.magnitude;
    
        return new Vector2(this.x / magnitude, this.y / magnitude);
    }
}

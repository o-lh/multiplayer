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
     * @param {Vector2} vector
     * @param {number} scalar
     */
    static multiplyScalar(vector, scalar) {
        return new Vector2(vector.x * scalar, vector.y * scalar);
    }

    /**
     * @param {Vector2} vectorA
     * @param {Vector2} vectorB
     */
    static dot(vectorA, vectorB) {
        return vectorA.x * vectorB.x + vectorA.y * vectorB.y;
    }

    /**
     * @param {Vector2[]} vectors
     */
    static equal(...vectors) {
        let allEqual = true;

        vectors.reduce((previousValue, currentValue) => {
            if (previousValue.x !== currentValue.x || previousValue.y !== currentValue.y) {
                allEqual = false;
            }

            return currentValue;
        });

        return allEqual;
    }

    get magnitude() {
        return Math.sqrt(this.sqrMagnitude);
    }

    get normalized() {
        const magnitude = this.magnitude;

        return new Vector2(this.x / magnitude, this.y / magnitude);
    }

    get sqrMagnitude() {
        return this.x ** 2 + this.y ** 2;
    }
}

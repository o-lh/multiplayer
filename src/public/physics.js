import { Vector2 } from "./vector2.js";

export class Physics {
    /**
     * @param {Vector2} point
     * @param {Vector2} circleCenter
     * @param {number} circleRadius
     */
    static pointCircleCollision(point, circleCenter, circleRadius) {
        return Vector2.subtract(circleCenter, point).sqrMagnitude <= circleRadius ** 2;
    }

    /**
     * @param {Vector2} lineStart
     * @param {Vector2} lineEnd
     * @param {Vector2} circleCenter
     * @param {number} circleRadius
     */
    static lineCircleCollision(lineStart, lineEnd, circleCenter, circleRadius) {
        const line = Vector2.subtract(lineEnd, lineStart);

        if (line.x === 0 && line.y === 0)
            return this.pointCircleCollision(lineStart, circleCenter, circleRadius);

        const toCircle = Vector2.subtract(circleCenter, lineStart);
        const t = Math.max(0, Math.min(Vector2.dot(line, toCircle) / line.sqrMagnitude, 1));
        const closestPoint = Vector2.add(lineStart, Vector2.multiplyScalar(line, t));

        return this.pointCircleCollision(closestPoint, circleCenter, circleRadius);
    }
}

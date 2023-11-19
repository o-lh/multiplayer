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
        const toCircle = Vector2.subtract(circleCenter, lineStart);

        const dotProduct = line.x * toCircle.y + line.y * toCircle.y;

        const unclampedT = dotProduct / line.sqrMagnitude;
        const t = Math.max(0, Math.min(dotProduct / line.sqrMagnitude, 1));

        const pointOnLine = new Vector2(
            lineStart.x + unclampedT * line.x,
            lineStart.y + unclampedT * line.y);

        return pointOnLine;
    }
}

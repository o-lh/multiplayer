import { Vector2 } from "./vector2.js";

export class Physics {
    /**
     * @param {Vector2} point
     * @param {Vector2} circleCenter
     * @param {number} circleRadius
     * @returns The point of intersection, or null if there is no intersection
     */
    static pointCircleCollision(point, circleCenter, circleRadius) {
        if (Vector2.subtract(circleCenter, point).sqrMagnitude <= circleRadius ** 2)
            return point;
    }

    /**
     * @param {Vector2} lineStart
     * @param {Vector2} lineEnd
     * @param {Vector2} circleCenter
     * @param {number} circleRadius
     * @returns The point of intersection, or null if there is no intersection
     */
    static lineCircleCollision(lineStart, lineEnd, circleCenter, circleRadius) {
        const line = Vector2.subtract(lineEnd, lineStart);

        if (line.x === 0 && line.y === 0)
            return this.pointCircleCollision(lineStart, circleCenter, circleRadius);

        const toCircle = Vector2.subtract(circleCenter, lineStart);
        const t = Vector2.dot(line, toCircle) / line.sqrMagnitude;
        const clampedT = Math.max(0, Math.min(t, 1));
        const closestPoint = Vector2.add(lineStart, Vector2.multiplyScalar(line, clampedT));
        return this.pointCircleCollision(closestPoint, circleCenter, circleRadius);
        // TODO: Return the actual point of intersection, instead of the closest point to the circle's center
    }

    /**
     * @param {Vector2} lineAStart
     * @param {Vector2} lineAEnd
     * @param {Vector2} lineBStart
     * @param {Vector2} lineBEnd
     */
    static lineLineCollision(lineAStart, lineAEnd, lineBStart, lineBEnd) {
        // TODO: When the two lines are parallel or coincident, the denominator is zero
        const t = ((lineAStart.x - lineBStart.x) * (lineBStart.y - lineBEnd.y) -
            (lineAStart.y - lineBStart.y) * (lineBStart.x - lineBEnd.x)) /
            ((lineAStart.x - lineAEnd.x) * (lineBStart.y - lineBEnd.y) -
            (lineAStart.y - lineAEnd.y) * (lineBStart.x - lineBEnd.x))

        const u = ((lineAStart.x - lineBStart.x) * (lineAStart.y - lineAEnd.y) -
            (lineAStart.y - lineBStart.y) * (lineAStart.x - lineAEnd.x)) /
            ((lineAStart.x - lineAEnd.x) * (lineBStart.y - lineBEnd.y) -
            (lineAStart.y - lineAEnd.y) * (lineBStart.x - lineBEnd.x))

        let intersection = null;

        if (t >= 0 && t <= 1 && u >= 0 && u <= 1)
            intersection = new Vector2(
                lineAStart.x + t * (lineAEnd.x - lineAStart.x),
                lineAStart.y + t * (lineAEnd.y - lineAStart.y)
            );
        
        return { intersection: intersection, t: t, u: u };
    }
}

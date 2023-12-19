import { Component } from "../component.js";
import { Game } from "../game.js";
import { Network } from "../network.js";
import { Physics } from "../physics.js";
import { Player } from "./player.js";
import { Renderer } from "../renderer.js";
import { Time } from '../time.js';
import { Vector2 } from "../vector2.js";

export class Projectile extends Component {
    /**
     * @param {Vector2} origin
     * @param {Vector2} direction
     */
    init(origin, direction) {
        this.origin = origin;
        this.direction = direction;
        this.entity.position = origin;
        this.tail = origin;
        this.speed = 50;
    }

    update() {
        this.entity.position = Vector2.add(
            this.entity.position,
            Vector2.multiplyScalar(this.direction, this.speed * Time.deltaTime)
        );

        // TODO: Spatial partitioning
        for (const wall of Game.walls) {
            if (Physics.lineLineIntersection(
                this.tail,
                this.entity.position,
                wall.startPoint,
                wall.endPoint
            ).intersection)
                this.entity.destroy();
        }

        // TODO: These boundaries are hard-coded
        if (this.tail.y < -10 || this.tail.x > 10 || this.tail.y > 10 || this.tail.x < -10) {
            this.entity.destroy();
            return;
        }

        this.tail = Vector2.subtract(
            this.entity.position,
            Vector2.multiplyScalar(this.direction, 2)
        );

        if (this.#isTailPastOrigin()) this.tail = this.origin;

        if (!Network.owns(this.entity)) return;

        for (const entity of Game.entities) {
            // TODO: Entity tags
            if (!entity.getComponent(Player)) continue;

            if (Network.owns(entity)) continue;

            if (!Physics.lineCircleCollision(
                this.tail,
                this.entity.position,
                entity.position,
                entity.getComponent(Player).size
            )) continue;

            Network.emit('projectile_hit', this.entity.id, entity.id);
            this.entity.destroy();
            ++entity.getComponent(Player).hitsTaken;
        }
    }

    render() {
        Renderer.renderLine('rgb(255, 255, 255)', this.tail, this.entity.position);
    }

    #isTailPastOrigin() {
        const sqrToTail = Vector2.subtract(this.entity.position, this.tail).sqrMagnitude;
        const sqrToOrigin = Vector2.subtract(this.entity.position, this.origin).sqrMagnitude;
        return sqrToTail > sqrToOrigin;
    }
}

import { Camera } from "../camera.js";
import { Component } from "../component.js";
import { Game } from "../game.js";
import { Network } from "../network.js";
import { Physics } from "../physics.js";
import { Player } from "./player.js";
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
        this.head = origin;
        this.tail = origin;
        this.speed = 50;
    }

    update() {
        this.head = Vector2.add(
            this.head,
            Vector2.multiplyScalar(this.direction, this.speed * Time.deltaTime)
        );

        // TODO: These boundaries are hard-coded
        if (this.tail.y < -10 || this.tail.x > 10 || this.tail.y > 10 || this.tail.x < -10) {
            this.entity.destroy();
            return;
        }

        this.tail = Vector2.subtract(
            this.head,
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
                this.head,
                entity.position,
                Game.PLAYER_RADIUS
            )) continue;

            Network.emit('projectile_hit', this.entity.id, entity.id);
            this.entity.destroy();
            ++entity.getComponent(Player).hitsTaken;
        }
    }

    render() {
        const lineStart = Camera.worldSpacePointToScreenSpace(this.tail);
        const lineEnd = Camera.worldSpacePointToScreenSpace(this.head);

        Game.context.beginPath();
        Game.context.strokeStyle = 'rgb(255, 255, 255)';
        Game.context.lineWidth = 2;
        Game.context.moveTo(lineStart.x, lineStart.y);
        Game.context.lineTo(lineEnd.x, lineEnd.y);
        Game.context.stroke();
    }

    #isTailPastOrigin() {
        const sqrToTail = Vector2.subtract(this.head, this.tail).sqrMagnitude;
        const sqrToOrigin = Vector2.subtract(this.head, this.origin).sqrMagnitude;
        return sqrToTail > sqrToOrigin;
    }
}

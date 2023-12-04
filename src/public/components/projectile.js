import { Component } from "../component.js";
import { Game } from "../game.js";
import { Physics } from "../physics.js";
import { Time } from '../time.js';
import { Vector2 } from "../vector2.js";

export class Projectile extends Component {
    /**
     * @param {string} owner
     * @param {Vector2} origin
     * @param {Vector2} direction
     * @param {number} speed
     */
    init(owner, origin, direction, speed) {
        this.owner = owner;
        this.origin = origin;
        this.direction = direction;
        this.speed = speed;
        this.head = origin;
        this.tail = origin;
    }

    update() {
        this.head = Vector2.add(
            this.head,
            Vector2.multiplyScalar(this.direction, this.speed * Time.deltaTime)
        );

        // TODO: These boundaries are hard-coded
        if (this.tail.y < -10 || this.tail.x > 10 || this.tail.y > 10 || this.tail.x < -10) {
            this.entity.destroyed = true;
            return;
        }

        this.tail = Vector2.subtract(
            this.head,
            Vector2.multiplyScalar(this.direction, 2)
        );

        if (this.#isTailPastOrigin()) this.tail = this.origin;

        if (this.owner === Game.socket.id) {
            for (const player of Game.otherPlayers) {
                if (Physics.lineCircleCollision(
                    this.tail,
                    this.head,
                    player.position,
                    Game.PLAYER_RADIUS
                )) {
                    Game.socket.emit('projectile_hit', this.entity.id, player.id);
                    this.entity.destroyed = true;
                    ++player.hitsTaken;
                }
            }
        }
    }

    render() {
        const lineStart = Game.worldSpacePointToScreenSpace(this.tail);
        const lineEnd = Game.worldSpacePointToScreenSpace(this.head);

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

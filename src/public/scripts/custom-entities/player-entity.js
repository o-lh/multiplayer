import { Game } from '../game.js';
import { Health } from '../components/health.js';
import { Player } from '../components/player.js';
import { Vector2 } from '../vector2.js';

/**
 * @param {Vector2} position
 * @param {number} healthMaximum
 * @param {number} healthCurrent
 */
export function createPlayer(position, healthMaximum, healthCurrent) {
    const entity = Game.addEntity(id);
    entity.addTag('Player');
    entity.position = position;

    entity.addComponent(Player);

    const health = entity.addComponent(Health);
    health.maximum = healthMaximum;
    health.current = healthCurrent;

    return entity;
}

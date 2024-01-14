import { AlternatingWall } from '../components/alternating-wall.js';
import { Game } from '../game.js';
import { LineCollider } from '../components/line-collider.js';
import { LineRenderer } from '../components/line-renderer.js';

export function createWallAlternating(startPoint, endPoint, initiallyEnabled) {
    const entity = Game.addEntity();
    entity.addTag('Wall');

    const collider = entity.addComponent(LineCollider);
    collider.startPoint = startPoint;
    collider.endPoint = endPoint;
    if (!initiallyEnabled) collider.enabled = false;

    const renderer = entity.addComponent(LineRenderer);
    renderer.layer = 3;
    renderer.startPoint = startPoint;
    renderer.endPoint = endPoint;
    if (!initiallyEnabled) renderer.enabled = false;

    entity.addComponent(AlternatingWall);

    return entity;
}

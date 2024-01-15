import { AlternatingWall } from '../components/alternating-wall.js';
import { Game } from '../game.js';
import { LineCollider } from '../components/line-collider.js';
import { LineRenderer } from '../components/line-renderer.js';

export function createWallAlternating(startPoint, endPoint, oppositeAlternation) {
    const entity = Game.addEntity();
    entity.addTag('Wall');

    const collider = entity.addComponent(LineCollider);
    collider.startPoint = startPoint;
    collider.endPoint = endPoint;

    const renderer = entity.addComponent(LineRenderer);
    renderer.layer = 3;
    renderer.startPoint = startPoint;
    renderer.endPoint = endPoint;

    const alternator = entity.addComponent(AlternatingWall);
    alternator.oppositeAlternation = oppositeAlternation;

    return entity;
}

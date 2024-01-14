import { Game } from '../game.js';
import { LineCollider } from '../components/line-collider.js';

export function createInvisibleWall(startPoint, endPoint) {
    const entity = Game.addEntity();
    entity.addTag('Wall');

    const collider = entity.addComponent(LineCollider);
    collider.startPoint = startPoint;
    collider.endPoint = endPoint;

    return entity;
}

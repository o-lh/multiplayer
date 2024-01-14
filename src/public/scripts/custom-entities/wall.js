import { Game } from '../game.js';
import { LineCollider } from '../components/line-collider.js';
import { LineRenderer } from '../components/line-renderer.js';

export function createWall(startPoint, endPoint) {
    const entity = Game.addEntity();
    entity.addTag('Wall');

    const collider = entity.addComponent(LineCollider);
    collider.startPoint = startPoint;
    collider.endPoint = endPoint;

    const wall = entity.addComponent(LineRenderer);
    wall.layer = 3;
    wall.startPoint = startPoint;
    wall.endPoint = endPoint;

    return entity;
}

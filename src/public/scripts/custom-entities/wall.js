import { Wall } from '../components/wall.js';
import { Game } from '../game.js';

export function createWall(startPoint, endPoint) {
    const entity = Game.addEntity();
    entity.addTag('Wall');
    const wall = entity.addComponent(Wall);
    wall.startPoint = startPoint;
    wall.endPoint = endPoint;
    return entity;
}

import { Game } from '../game.js';
import { Projectile } from '../components/projectile.js';

export function createProjectile({ id = undefined, origin, direction }) {
    const entity = Game.addEntity(id);

    entity.addComponent(Projectile).init(origin, direction);

    return entity;
}

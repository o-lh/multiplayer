import { Game } from "./game.js";
import { Vector2 } from "./vector2.js";

export class Camera {
    static worldSpacePointToScreenSpace(point) {
        return new Vector2(
            Game.canvas.width / 2 + point.x * Game.canvas.width / Game.CANVAS_WORLD_SPACE_WIDTH,
            Game.canvas.height / 2 + point.y * Game.canvas.height / Game.CANVAS_WORLD_SPACE_HEIGHT
        );
    }

    // TODO: What about for a non-square canvas?
    static worldSpaceLengthToScreenSpace(length) {
        return length * Game.canvas.height / Game.CANVAS_WORLD_SPACE_HEIGHT;
    }

    static screenSpacePointToWorldSpace(point) {
        return new Vector2(
            point.x / Game.canvas.width * Game.CANVAS_WORLD_SPACE_WIDTH - Game.CANVAS_WORLD_SPACE_WIDTH / 2,
            point.y / Game.canvas.height * Game.CANVAS_WORLD_SPACE_HEIGHT - Game.CANVAS_WORLD_SPACE_HEIGHT / 2
        );
    }
}

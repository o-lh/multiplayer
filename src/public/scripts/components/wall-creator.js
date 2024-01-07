import { Component } from "../component.js";
import { Game } from "../game.js";
import { Input } from "../input.js";
import { Renderer } from "../renderer.js";
import { Vector2 } from "../vector2.js";

export class WallCreator extends Component {
    startPoint = null;
    endPoint = null;

    update() {
        let created = false;

        if (Input.keyPressed('Digit1')) {
            this.startPoint = Input.mousePositionWorldSpace;
            if (this.endPoint) created = true;
        }

        if (Input.keyPressed('Digit2')) {
            this.endPoint = Input.mousePositionWorldSpace;
            if (this.startPoint) created = true;
        }

        if (created) {
            Game.walls = [];
            Game.walls.push({ startPoint: this.startPoint, endPoint: this.endPoint });
        }
    }

    render() {
        if (!this.startPoint || !this.endPoint) return;
        
        Renderer.renderLine('rgb(255, 255, 255)', this.startPoint, this.endPoint);

        Renderer.renderText(
            'rgb(255, 255, 255)',
            '1',
            new Vector2(this.startPoint.x, this.startPoint.y - 0.2)
        );

        Renderer.renderText(
            'rgb(255, 255, 255)',
            '2',
            new Vector2(this.endPoint.x, this.endPoint.y - 0.2)
        );
    }
}

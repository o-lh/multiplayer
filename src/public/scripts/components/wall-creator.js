import { Component } from "../component.js";
import { Game } from "../game.js";
import { Input } from "../input.js";
import { Renderer } from "../renderer.js";

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
        for (const wall of Game.walls) {
            Renderer.renderLine('rgb(255, 255, 255)', wall.startPoint, wall.endPoint);
        }
    }
}

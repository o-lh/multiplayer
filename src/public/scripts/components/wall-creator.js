import { Component } from "../component.js";
import { Input } from "../input.js";
import { Renderer } from "../renderer.js";

export class WallCreator extends Component {
    init() {
        this.startPoint = null;
        this.endPoint = null;
    }

    update() {
        if (Input.keyPressed('Digit1')) this.startPoint = Input.mousePositionWorldSpace;
        if (Input.keyPressed('Digit2')) this.endPoint = Input.mousePositionWorldSpace;
    }

    render() {
        if (this.startPoint && this.endPoint) {
            Renderer.renderLine('rgb(255, 255, 255)', this.startPoint, this.endPoint);
        }
    }
}

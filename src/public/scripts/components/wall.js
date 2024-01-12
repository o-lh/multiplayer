import { Component } from '../component.js';
import { Renderer } from '../renderer.js';
import { Shape } from '../shape.js';

export class Wall extends Component {
    startPoint = null;
    endPoint = null;

    render() {
        Renderer.render(3, Shape.Line, 'rgb(255, 255, 255)', this.startPoint, this.endPoint);
    }
}

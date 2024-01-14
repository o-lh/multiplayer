import { Component } from '../component.js';
import { Renderer } from '../renderer.js';
import { Shape } from '../shape.js';

export class LineRenderer extends Component {
    layer = null;
    startPoint = null;
    endPoint = null;

    render() {
        Renderer.render(this.layer, Shape.Line, 'rgb(255, 255, 255)', this.startPoint, this.endPoint);
    }
}

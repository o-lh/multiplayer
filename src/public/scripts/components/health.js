import { Component } from '../component.js';
import { Renderer } from '../renderer.js';
import { Shape } from '../shape.js';
import { Vector2 } from '../vector2.js';

export class Health extends Component {
    maximum;
    current;

    render() {
        const healthBarPosition = Vector2.subtract(
            this.entity.position,
            new Vector2(0.4, 0.5)
        );

        Renderer.render(
            5,
            Shape.Rectangle,
            'black',
            healthBarPosition,
            new Vector2(0.8, 0.1)
        );

        const healthBarFill = 0.8 * this.current / this.maximum;

        Renderer.render(
            5,
            Shape.Rectangle,
            'white',
            healthBarPosition,
            new Vector2(healthBarFill, 0.1)
        );
    }

    takeDamage(amount) {
        this.current -= amount;

        // TODO: On-death effects
        this.entity.destroy();
    }
}

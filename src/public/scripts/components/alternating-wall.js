import { Component } from '../component.js';
import { LineCollider } from './line-collider.js';
import { LineRenderer } from './line-renderer.js';
import { Network } from '../network.js';

export class AlternatingWall extends Component {
    collider = this.entity.getComponent(LineCollider);
    renderer = this.entity.getComponent(LineRenderer);
    oppositeAlternation;

    start() {
        Network.subscribe('doorState', (doorState) => {
            this.collider.enabled =
                doorState === 1 ? this.oppositeAlternation : !this.oppositeAlternation;
            this.renderer.enabled =
                doorState === 1 ? this.oppositeAlternation : !this.oppositeAlternation;
        });
    }
}

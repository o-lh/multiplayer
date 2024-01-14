import { Component } from '../component.js';
import { Time } from '../time.js';
import { LineCollider } from './line-collider.js';
import { LineRenderer } from './line-renderer.js';

export class AlternatingWall extends Component {
    collider = this.entity.getComponent(LineCollider);
    renderer = this.entity.getComponent(LineRenderer);
    t = 0;

    update() {
        this.t += Time.deltaTime;
        if (this.t >= 1) {
            this.t -= 1;
            this.collider.enabled = !this.collider.enabled;
            this.renderer.enabled = !this.renderer.enabled;
        }
    }
}

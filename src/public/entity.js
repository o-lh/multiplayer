import { v4 as uuidv4 } from './uuid/index.js';

import { Vector2 } from './vector2.js';

export class Entity {
    constructor() {
        /** @type {string} */
        this.id = uuidv4();
        this.destroyed = false;
        this.position = new Vector2();
        /** @type {Component[]} */
        this.components = [];
    }

    /**
     * @param {class} component
     * @returns {Component}
     */
    addComponent(component) {
        const addedComponent = this.components[this.components.push(new component(this)) - 1];
        addedComponent.constructorName = addedComponent.constructor.name;

        return addedComponent;
    }

    destroy() {
        this.destroyed = true;
    }

    /**
     * @param {class} component
     * @returns {Component | undefined}
     */
    getComponent(component) {
        return this.components.find(x => x instanceof component);
    }
}

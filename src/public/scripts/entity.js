import { IDManager } from './id-manager.js';

import { Vector2 } from './vector2.js';

export class Entity {
    id;
    destroyed = false;
    position = new Vector2();
    /** @type {Component[]} */
    components = [];

    /**
     * @param {string} [id]
     */
    constructor(id) {
        this.id = id ? id : IDManager.newID();
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

    /**
     * @param {class} component
     * @returns {Component | undefined}
     */
    getComponent(component) {
        return this.components.find(x => x instanceof component);
    }
}

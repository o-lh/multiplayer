import { Network } from './network.js';
import { Vector2 } from './vector2.js';

export class Entity {
    static nextID = 0;

    // TODO: Some of these have to be public purely for the sake of emitting over the network
    id;
    owner;
    /** @type {string[]} */
    tags = []; // TODO: Bits instead of strings
    position = new Vector2();
    /** @type {Component[]} */
    components = [];
    #destroyed = false;

    get destroyed() {
        return this.#destroyed;
    }

    /**
     * @param {string} id
     * @param {string} owner
     */
    constructor(id = null, owner = null) {
        this.id = id ? id : `${Network.socketID}-${Entity.nextID++}`;
        this.owner = owner ? owner : Network.socketID;
    }

    destroy() {
        this.#destroyed = true;
    }

    /**
     * @param {string} tag
     */
    addTag(tag) {
        if (this.hasTag(tag)) return;
        this.tags.push(tag);
    }

    /**
     * @param {string} tag
     * @returns {boolean}
     */
    hasTag(tag) {
        return this.tags.includes(tag);
    }

    /**
     * @param {class} component
     * @returns {Component}
     */
    addComponent(component) {
        const addedComponent = this.components[this.components.push(new component(this)) - 1];
        addedComponent.constructorName = addedComponent.constructor.name;
        addedComponent.start();
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

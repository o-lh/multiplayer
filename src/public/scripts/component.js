import { Entity } from './entity.js';

export class Component {
    enabled = true;
    #entity;

    get entity() {
        return this.#entity;
    }

    set entity(entity) {
        this.#entity = entity;
    }

    /**
     * @param {Entity} entity
     */
    constructor(entity) {
        /** @type {Entity} */
        this.#entity = entity;
    }

    start() {}

    update() {}

    render() {}
}

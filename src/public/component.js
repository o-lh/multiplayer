import { Entity } from "./entity.js";

export class Component {
    /**
     * @param {Entity} entity
     */
    constructor(entity) {
        /** @type {Entity} */
        this.entity = entity;
    }

    update() {}

    render() {}
}

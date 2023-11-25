import { v4 as uuidv4 } from './uuid/index.js';

export class Entity {
    constructor() {
        this.id = uuidv4();
    }
}

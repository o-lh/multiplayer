import { Network } from './network.js';

export class IDManager {
    static nextID = 0;

    static newID() {
        return `${Network.socket.id}-${this.nextID++}`;
    }
}

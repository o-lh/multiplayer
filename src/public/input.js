export class Input {
    /** @type {string[]} */
    static #keysPressed = [];
    /** @type {string[]} */
    static #keysHeld = [];
    /** @type {string[]} */
    static #keysReleased = [];

    static init() {
        addEventListener('keydown', event => {
            if (event.repeat) return;

            this.#keysPressed.push(event.code);
            this.#keysHeld.push(event.code);
        });

        addEventListener('keyup', event => {
            this.#keysReleased.push(event.code);
            this.#keysHeld.splice(this.#keysHeld.findIndex(x => x === event.code), 1);
        });

        return () => {
            this.#keysPressed = [];
            this.#keysReleased = [];
        };
    }

    /**
     * @param {string} keyCode
     */
    static keyPressed(keyCode) {
        return this.#keysPressed.includes(keyCode);
    }

    /**
     * @param {string} keyCode
     */
    static keyHeld(keyCode) {
        return this.#keysHeld.includes(keyCode);
    }

    /**
     * @param {string} keyCode
     */
    static keyReleased(keyCode) {
        return this.#keysReleased.includes(keyCode);
    }
}

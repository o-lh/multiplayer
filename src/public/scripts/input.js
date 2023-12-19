import { Renderer } from "./renderer.js";
import { Vector2 } from "./vector2.js";

export class Input {
    /** @type {string[]} */
    static #keysPressed = [];
    /** @type {string[]} */
    static #keysHeld = [];
    /** @type {string[]} */
    static #keysReleased = [];
    /** @type {number[]} */
    static #mousePressed = [];
    /** @type {number[]} */
    static #mouseHeld = [];
    /** @type {number[]} */
    static #mouseReleased = [];
    static #mousePosition = new Vector2();

    static get mousePositionWorldSpace() {
        return Renderer.screenSpacePointToWorldSpace(this.#mousePosition);
    }

    static init() {
        addEventListener('contextmenu', (event) => event.preventDefault());

        addEventListener('keydown', event => {
            if (event.repeat) return;

            this.#keysPressed.push(event.code);
            if (!this.#keysHeld.includes(event.code)) this.#keysHeld.push(event.code);
        });

        addEventListener('keyup', event => {
            this.#keysReleased.push(event.code);
            this.#keysHeld.splice(this.#keysHeld.findIndex(x => x === event.code), 1);
        });

        addEventListener('mousedown', event => {
            this.#mousePressed.push(event.button);
            if (!this.#mouseHeld.includes(event.button)) this.#mouseHeld.push(event.button);
            this.#mousePosition.x = event.x;
            this.#mousePosition.y = event.y;
        });

        addEventListener('mouseup', event => {
            this.#mouseReleased.push(event.button);
            this.#mouseHeld.splice(this.#mouseHeld.findIndex(x => x === event.button), 1);
            this.#mousePosition.x = event.x;
            this.#mousePosition.y = event.y;
        });

        addEventListener('mousemove', event => {
            this.#mousePosition.x = event.x;
            this.#mousePosition.y = event.y;
        });

        return () => {
            this.#keysPressed = [];
            this.#keysReleased = [];
            this.#mousePressed = [];
            this.#mouseReleased = [];
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

    /**
     * @param {number} mouseButton
     */
    static mousePressed(mouseButton) {
        return this.#mousePressed.includes(mouseButton);
    }

    /**
     * @param {number} mouseButton
     */
    static mouseHeld(mouseButton) {
        return this.#mouseHeld.includes(mouseButton);
    }

    /**
     * @param {number} mouseButton
     */
    static mouseReleased(mouseButton) {
        return this.#mouseReleased.includes(mouseButton);
    }
}

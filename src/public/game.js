export class Game {
    static deltaTime = 0;
    static #prev = 0;

    static run() {
        requestAnimationFrame(Game.#update);
    }

    static #update(t) {
        Game.deltaTime = (t - Game.#prev) / 1000;
        Game.#prev = t;

        requestAnimationFrame(Game.#update);
    }
}

export class Time {
    // TODO: Manage the deltaTime for the first frame properly (currently includes loading time, use performance.now()?)
    static deltaTime;
    static #prev = 0;

    /**
     * @param {DOMHighResTimeStamp} time
     */
    static tick(time) {
        this.deltaTime = (time - this.#prev) / 1000;
        this.#prev = time;
    }
}

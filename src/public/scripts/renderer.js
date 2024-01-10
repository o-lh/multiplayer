import { Shape } from "./shape.js";
import { Vector2 } from "./vector2.js";

export class Renderer {
    /** @type {HTMLCanvasElement} */
    static canvas = document.getElementById('canvas');
    /** @type {CanvasRenderingContext2D} */
    static context = this.canvas.getContext('2d');
    // TODO: Camera class
    static viewSize = new Vector2(20, 20);
    // TODO: Create RenderLayer class?
    static #layers = [];

    static init() {
        this.#setCanvasProperties();

        addEventListener('resize', (_) => this.#setCanvasProperties());
    }

    /**
     * @param {Vector2} point
     */
    static worldSpacePointToScreenSpace(point) {
        return new Vector2(
            this.canvas.width / 2 + point.x * this.canvas.width / this.viewSize.x,
            this.canvas.height / 2 + point.y * this.canvas.height / this.viewSize.y
        );
    }

    // TODO: What about for a non-square canvas?
    /**
     * @param {number} length
     */
    static worldSpaceLengthToScreenSpace(length) {
        return length * this.canvas.height / this.viewSize.y;
    }

    /**
     * @param {Vector2} point
     */
    static screenSpacePointToWorldSpace(point) {
        return new Vector2(
            (point.x - this.canvas.offsetLeft) / this.canvas.width *
            this.viewSize.x - this.viewSize.x / 2,
            (point.y - this.canvas.offsetTop) / this.canvas.height *
            this.viewSize.y - this.viewSize.y / 2
        );
    }

    static renderScene() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (const layer of this.#layers) {
            for (const renderItem of layer) {
                switch (renderItem.shape) {
                    case Shape.Circle: this.#renderCircle(...renderItem.data); break;
                    case Shape.Line: this.#renderLine(...renderItem.data); break;
                    case Shape.Text: this.#renderText(...renderItem.data); break;
                }
            }
        }

        this.#layers = [];
    }

    /**
     * @param {number} layer
     * @param {Shape} shape
     * @param  {...any} data
     */
    static render(layer, shape, ...data) {
        if (layer < 0) layer = 0;
        while (layer >= this.#layers.length) this.#layers.push([]);

        this.#layers[layer].push({ shape: shape, data: data });
    }

    /**
     * @param {string | CanvasGradient | CanvasPattern} colour
     * @param {Vector2} position
     * @param {number} radius
     */
    static #renderCircle(colour, position, radius) {
        const screenSpacePosition = this.worldSpacePointToScreenSpace(position);

        this.context.fillStyle = colour;
        this.context.beginPath();
        this.context.arc(
            screenSpacePosition.x,
            screenSpacePosition.y,
            this.worldSpaceLengthToScreenSpace(radius),
            0,
            2 * Math.PI,
            false
        );
        this.context.fill();
    }

    /**
     * @param {string | CanvasGradient | CanvasPattern} colour
     * @param {Vector2} start
     * @param {Vector2} end
     */
    static #renderLine(colour, start, end) {
        const screenSpaceStart = this.worldSpacePointToScreenSpace(start);
        const screenSpaceEnd = this.worldSpacePointToScreenSpace(end);

        this.context.beginPath();
        this.context.strokeStyle = colour;
        this.context.lineWidth = 2;
        this.context.moveTo(screenSpaceStart.x, screenSpaceStart.y);
        this.context.lineTo(screenSpaceEnd.x, screenSpaceEnd.y);
        this.context.stroke();
    }

    /**
     * @param {string | CanvasGradient | CanvasPattern} colour
     * @param {string} text
     * @param {Vector2} position
     */
    static #renderText(colour, text, position) {
        const screenSpacePosition = this.worldSpacePointToScreenSpace(position);

        this.context.fillStyle = colour;
        this.context.fillText(text, screenSpacePosition.x, screenSpacePosition.y);
    }

    static #setCanvasProperties() {
        this.canvas.width = innerWidth > innerHeight ? innerHeight : innerWidth;
        this.canvas.height = innerWidth > innerHeight ? innerHeight : innerWidth;
        this.context.font = '20px sans-serif';
        this.context.textAlign = 'center';
    }
}

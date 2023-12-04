import { Component } from "../component.js";

export class Player extends Component {
    init() {
        this.speed = 4;
        this.attackInterval = 0.2;
        this.attackT = 0;
        this.hitsTaken = 0;
    }
}

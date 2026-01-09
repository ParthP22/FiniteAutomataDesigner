/*
 Portions of this file are adapted from:

 Copyright (c) 2010 Evan Wallace
 Finite State Machine Designer (https://madebyevan.com/fsm/)
 Licensed under the MIT License

 Modifications:
 Copyright (c) 2025 Mohammed Mowla and Parth Patel
 Licensed under the MIT Licenses
*/
import { nodeRadius, drawText } from "./draw";
export let circles = [];
export let circleIdCounter = 0;
export class Circle {
    constructor(x, y) {
        this.id = 'c' + circleIdCounter;
        this.x = x,
            this.y = y;
        this.mouseOffsetX = 0;
        this.mouseOffsetY = 0;
        this.isAccept = false;
        this.text = '';
        this.outArrows = new Set();
        this.loop = null;
        // Increment ID
        circleIdCounter++;
    }
    setMouseStart(x, y) {
        this.mouseOffsetX = this.x - x;
        this.mouseOffsetY = this.y - y;
    }
    setAnchorPoint(x, y) {
        this.x = x + this.mouseOffsetX;
        this.y = y + this.mouseOffsetY;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, nodeRadius, 0, 2 * Math.PI, false);
        ctx.stroke();
        drawText(ctx, this.text, this.x, this.y, null);
        if (this.isAccept) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, nodeRadius - 5, 0, 2 * Math.PI, false);
            ctx.stroke();
        }
    }
    closestPointOnCircle(x, y) {
        var dx = x - this.x;
        var dy = y - this.y;
        var scale = Math.sqrt(dx * dx + dy * dy);
        return {
            'x': this.x + dx * nodeRadius / scale,
            'y': this.y + dy * nodeRadius / scale
        };
    }
    containsPoint(x, y) {
        return (x - this.x) * (x - this.x) + (y - this.y) * (y - this.y) < nodeRadius * nodeRadius;
    }
}

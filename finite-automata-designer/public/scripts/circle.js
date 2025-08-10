import { selectedObj, nodeRadius, drawText } from "./draw";
export var circles = [];
export class Circle {
    constructor(x, y) {
        this.x = x,
            this.y = y;
        this.mouseOffsetX = 0;
        this.mouseOffsetY = 0;
        this.isAccept = false;
        this.text = '';
        this.outArrows = [];
        this.loop = false;
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
        drawText(ctx, this.text, this.x, this.y, null, selectedObj == this);
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

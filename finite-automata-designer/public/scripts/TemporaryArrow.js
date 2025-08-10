import { drawArrow } from "./draw";
export class TemporaryArrow {
    constructor(startPoint, endPoint) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.endPoint.x, this.endPoint.y);
        ctx.lineTo(this.startPoint.x, this.startPoint.y);
        ctx.stroke();
        drawArrow(ctx, this.endPoint.x, this.endPoint.y, Math.atan2(this.endPoint.y - this.startPoint.y, this.endPoint.x - this.startPoint.x));
    }
}

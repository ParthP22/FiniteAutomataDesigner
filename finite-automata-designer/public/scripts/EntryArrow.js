import { drawArrow, drawText, selectedObj, snapToPadding, hitTargetPadding } from "./draw";
export class EntryArrow {
    constructor(pointsToCircle, startPoint) {
        this.pointsToCircle = pointsToCircle;
        this.deltaX = 0;
        this.deltaY = 0;
        this.text = '';
        if (startPoint) {
            this.setAnchorPoint(startPoint.x, startPoint.y);
        }
    }
    draw(ctx) {
        var points = this.getEndPoints();
        ctx.beginPath();
        ctx.moveTo(points.startX, points.startY);
        ctx.lineTo(points.endX, points.endY);
        ctx.stroke();
        // Draw the text at the end without the arrow
        var textAngle = Math.atan2(points.startY - points.endY, points.startX - points.endX);
        drawText(ctx, this.text, points.startX, points.startY, textAngle, selectedObj == this);
        // Draw the head of the arrow
        drawArrow(ctx, points.endX, points.endY, Math.atan2(-this.deltaY, -this.deltaX));
    }
    setAnchorPoint(x, y) {
        this.deltaX = x - this.pointsToCircle.x;
        this.deltaY = y - this.pointsToCircle.y;
        if (Math.abs(this.deltaX) < snapToPadding)
            this.deltaX = 0;
        if (Math.abs(this.deltaY) < snapToPadding)
            this.deltaY = 0;
    }
    getEndPoints() {
        var startX = this.pointsToCircle.x + this.deltaX;
        var startY = this.pointsToCircle.y + this.deltaY;
        var end = this.pointsToCircle.closestPointOnCircle(startX, startY);
        return {
            'startX': startX,
            'startY': startY,
            'endX': end.x,
            'endY': end.y,
        };
    }
    containsPoint(x, y) {
        var lineInfo = this.getEndPoints();
        var dx = lineInfo.endX - lineInfo.startX;
        var dy = lineInfo.endY - lineInfo.startY;
        var length = Math.sqrt(dx * dx + dy * dy);
        var percent = (dx * (x - lineInfo.startX) + dy * (y - lineInfo.startY)) / (length * length);
        var distance = (dx * (y - lineInfo.startY) - dy * (x - lineInfo.startX)) / length;
        return (percent > 0 && percent < 1 && Math.abs(distance) < hitTargetPadding);
    }
}

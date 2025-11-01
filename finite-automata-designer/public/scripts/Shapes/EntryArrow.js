/*
 Portions of this file are adapted from:

 Copyright (c) 2010 Evan Wallace
 Finite State Machine Designer (https://madebyevan.com/fsm/)
 Licensed under the MIT License

 Modifications:
 Copyright (c) 2025 Mohammed Mowla and Parth Patel
 Licensed under the MIT Licenses
*/
import { drawArrow, drawText, snapToPadding, hitTargetPadding } from "./draw";
// The startState will be an EntryArrow. If you wish to
// access the start state node itself, you can use the
// pointsToCircle attribute of the EntryArrow to do so.
// Since we are not storing the EntryArrow itself as an
// attribute for Circles, it was best that the startState
// was set to the EntryArrow instead of its Circle
export var startState = null;
// Since the startState will be imported, it cannot be reassigned
// as usual, so this setter method will enable you to do so
export function setStartState(newEntryArrow) {
    startState = newEntryArrow;
}
export class EntryArrow {
    constructor(pointsToCircle, startPoint) {
        this.pointsToCircle = pointsToCircle;
        this.deltaX = 0;
        this.deltaY = 0;
        this.startPoint = startPoint;
        // this.text = ''
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
        // Draw the text at the end without the fillrow
        var textAngle = Math.atan2(points.startY - points.endY, points.startX - points.endX);
        drawText(ctx, "", points.startX, points.startY, textAngle);
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

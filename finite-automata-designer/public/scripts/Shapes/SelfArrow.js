/*
 Portions of this file are adapted from:

 Copyright (c) 2010 Evan Wallace
 Finite State Machine Designer (https://madebyevan.com/fsm/)
 Licensed under the MIT License

 Modifications:
 Copyright (c) 2025 Mohammed Mowla and Parth Patel
 Licensed under the MIT Licenses
*/
import { drawArrow, drawText, nodeRadius, hitTargetPadding } from "./draw";
export class SelfArrow {
    constructor(pointsToCircle, point) {
        this.circle = pointsToCircle;
        this.startCircle = pointsToCircle;
        this.endCircle = pointsToCircle;
        this.anchorAngle = 0;
        this.mouseOffsetAngle = 0;
        this.text = '';
        this.transition = new Set();
        this.point = point;
        if (point) {
            this.setAnchorPoint(point.x, point.y);
        }
    }
    draw(ctx) {
        var arcInfo = this.getEndPointsAndCircle();
        // draw arc
        ctx.beginPath();
        ctx.arc(arcInfo.circleX, arcInfo.circleY, arcInfo.circleRadius, arcInfo.startAngle, arcInfo.endAngle, false);
        ctx.stroke();
        // Draw the text on the loop farthest from the circle
        var textX = arcInfo.circleX + arcInfo.circleRadius * Math.cos(this.anchorAngle);
        var textY = arcInfo.circleY + arcInfo.circleRadius * Math.sin(this.anchorAngle);
        drawText(ctx, this.text, textX, textY, this.anchorAngle);
        // draw the head of the arrow
        drawArrow(ctx, arcInfo.endX, arcInfo.endY, arcInfo.endAngle + Math.PI * 0.4);
    }
    setMouseStart(x, y) {
        this.mouseOffsetAngle = this.anchorAngle - Math.atan2(y - this.circle.y, x - this.circle.x);
    }
    setAnchorPoint(x, y) {
        this.anchorAngle = Math.atan2(y - this.circle.y, x - this.circle.x) + this.mouseOffsetAngle;
        // snap to 90 degrees
        var snap = Math.round(this.anchorAngle / (Math.PI / 2)) * (Math.PI / 2);
        if (Math.abs(this.anchorAngle - snap) < 0.1)
            this.anchorAngle = snap;
        // keep in the range -pi to pi so our containsPoint() function always works
        if (this.anchorAngle < -Math.PI)
            this.anchorAngle += 2 * Math.PI;
        if (this.anchorAngle > Math.PI)
            this.anchorAngle -= 2 * Math.PI;
    }
    getEndPointsAndCircle() {
        var circleX = this.circle.x + 1.5 * nodeRadius * Math.cos(this.anchorAngle);
        var circleY = this.circle.y + 1.5 * nodeRadius * Math.sin(this.anchorAngle);
        var circleRadius = 0.75 * nodeRadius;
        var startAngle = this.anchorAngle - Math.PI * 0.8;
        var endAngle = this.anchorAngle + Math.PI * 0.8;
        var startX = circleX + circleRadius * Math.cos(startAngle);
        var startY = circleY + circleRadius * Math.sin(startAngle);
        var endX = circleX + circleRadius * Math.cos(endAngle);
        var endY = circleY + circleRadius * Math.sin(endAngle);
        return {
            'hasCircle': true,
            'startX': startX,
            'startY': startY,
            'endX': endX,
            'endY': endY,
            'startAngle': startAngle,
            'endAngle': endAngle,
            'circleX': circleX,
            'circleY': circleY,
            'circleRadius': circleRadius
        };
    }
    containsPoint(x, y) {
        var stuff = this.getEndPointsAndCircle();
        var dx = x - stuff.circleX;
        var dy = y - stuff.circleY;
        var distance = Math.sqrt(dx * dx + dy * dy) - stuff.circleRadius;
        return (Math.abs(distance) < hitTargetPadding);
    }
}

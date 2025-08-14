import {Circle} from "./circle";
import { SelfArrow } from "./SelfArrow";
import { EntryArrow } from "./EntryArrow";
import { snapToPadding, nodeRadius, drawArrow, drawText, hitTargetPadding } from "./draw";

export var arrows: (Arrow | SelfArrow | EntryArrow)[] = [];
// export var lastEditedArrow: Arrow | SelfArrow | null = null;

// export interface SharedState {
//     lastEditedArrow: Arrow | SelfArrow | null;
// }  

// export var sharedState: {
//     lastEditedArrow: Arrow | SelfArrow | null;
// } = {
//     lastEditedArrow: null,
// };

// export var sharedState = {
//     {lastEditedArrow: lastEditedArrowType;} = {lastEditedArrow = null}
// };




function circleFromThreePoints(
  x1: number, 
  y1: number, 
  x2: number, 
  y2: number, 
  x3: number, 
  y3: number) {
	var a = det(x1, y1, 1, x2, y2, 1, x3, y3, 1);
	var bx = -det(x1*x1 + y1*y1, y1, 1, x2*x2 + y2*y2, y2, 1, x3*x3 + y3*y3, y3, 1);
	var by = det(x1*x1 + y1*y1, x1, 1, x2*x2 + y2*y2, x2, 1, x3*x3 + y3*y3, x3, 1);
	var c = -det(x1*x1 + y1*y1, x1, y1, x2*x2 + y2*y2, x2, y2, x3*x3 + y3*y3, x3, y3);
	return {
		'x': -bx / (2*a),
		'y': -by / (2*a),
		'radius': Math.sqrt(bx*bx + by*by - 4*a*c) / (2*Math.abs(a))
	};
}

function det(
  a: number, 
  b: number, 
  c: number, 
  d: number, 
  e: number, 
  f: number, 
  g: number, 
  h: number, 
  i: number
) {
	return a*e*i + b*f*g + c*d*h - a*f*h - b*d*i - c*e*g;
}

export class Arrow {
  startCircle: Circle;
  endCircle: Circle;
  text: string;
  lineAngleAdjust: number; // value to add to textAngle when link is straight line
  parallelPart: number;
  perpendicularPart: number;
  transition: string[];


  constructor(startCircle: Circle, endCircle: Circle) {
    this.startCircle = startCircle;
    this.endCircle = endCircle;

    startCircle.outArrows.add(this);
    // endCircle.inArrows.add(this);

    this.text = '';
    this.lineAngleAdjust = 0;
    // Make anchor point relative to the locations of start and end circles
    this.parallelPart = 0.5; // percent from start to end circle
    this.perpendicularPart = 0; // pixels from start to end circle

    this.transition = [];
  }

    getAnchorPoint() {
        var dx = this.endCircle.x - this.startCircle.x;
        var dy = this.endCircle.y - this.startCircle.y;
        var scale = Math.sqrt(dx * dx + dy * dy);
        return {
            'x': this.startCircle.x + dx * this.parallelPart - dy * this.perpendicularPart / scale,
            'y': this.startCircle.y + dy * this.parallelPart + dx * this.perpendicularPart / scale
        };
    }

    setAnchorPoint(x: number, y: number) {
        var dx = this.endCircle.x - this.startCircle.x;
        var dy = this.endCircle.y - this.startCircle.y;
        var scale = Math.sqrt(dx * dx + dy * dy);
        this.parallelPart = (dx * (x - this.startCircle.x) + dy * (y - this.startCircle.y)) / (scale * scale);
        this.perpendicularPart = (dx * (y - this.startCircle.y) - dy * (x - this.startCircle.x)) / scale;
        // snap to a straight line
        if (this.parallelPart > 0 && this.parallelPart < 1 && Math.abs(this.perpendicularPart) < snapToPadding) {
            this.lineAngleAdjust = (this.perpendicularPart < 0 ? 1 : 0) * Math.PI;
            this.perpendicularPart = 0;
        }
    }

    getEndPointsAndCircle() {
        if (this.perpendicularPart == 0) {
            var midX = (this.startCircle.x + this.endCircle.x) / 2;
            var midY = (this.startCircle.y + this.endCircle.y) / 2;
            var start = this.startCircle.closestPointOnCircle(midX, midY);
            var end = this.endCircle.closestPointOnCircle(midX, midY);
            return {
                'hasCircle': false,
                'startX': start.x,
                'startY': start.y,
                'endX': end.x,
                'endY': end.y,
            };
        }

        var anchor = this.getAnchorPoint();
        var circle = circleFromThreePoints(this.startCircle.x, this.startCircle.y, this.endCircle.x, this.endCircle.y, anchor.x, anchor.y);
        var isReversed = (this.perpendicularPart > 0);
        var reverseScale = isReversed ? 1 : -1;
        var startAngle = Math.atan2(this.startCircle.y - circle.y, this.startCircle.x - circle.x) - reverseScale * nodeRadius / circle.radius;
        var endAngle = Math.atan2(this.endCircle.y - circle.y, this.endCircle.x - circle.x) + reverseScale * nodeRadius / circle.radius;
        var startX = circle.x + circle.radius * Math.cos(startAngle);
        var startY = circle.y + circle.radius * Math.sin(startAngle);
        var endX = circle.x + circle.radius * Math.cos(endAngle);
        var endY = circle.y + circle.radius * Math.sin(endAngle);
        return {
            'hasCircle': true,
            'startX': startX,
            'startY': startY,
            'endX': endX,
            'endY': endY,
            'startAngle': startAngle,
            'endAngle': endAngle,
            'circleX': circle.x,
            'circleY': circle.y,
            'circleRadius': circle.radius,
            'reverseScale': reverseScale,
            'isReversed': isReversed,
        };
    }

    draw(ctx: CanvasRenderingContext2D) {

        var pointInfo = this.getEndPointsAndCircle();
        // draw arc
        ctx.beginPath();
        if (pointInfo.hasCircle && pointInfo.circleX) {
            ctx.arc(pointInfo.circleX, pointInfo.circleY, pointInfo.circleRadius, pointInfo.startAngle, pointInfo.endAngle, pointInfo.isReversed);
        } else {
            ctx.moveTo(pointInfo.startX, pointInfo.startY);
            ctx.lineTo(pointInfo.endX, pointInfo.endY);
        }
        ctx.stroke();
        // draw the head of the arrow
        if (pointInfo.hasCircle && pointInfo.endAngle) {
            drawArrow(ctx, pointInfo.endX, pointInfo.endY, pointInfo.endAngle - pointInfo.reverseScale * (Math.PI / 2));
        } else {
            drawArrow(ctx, pointInfo.endX, pointInfo.endY, Math.atan2(pointInfo.endY - pointInfo.startY, pointInfo.endX - pointInfo.startX));
        }
    if (pointInfo.hasCircle) {
      var startAngle = pointInfo.startAngle;
      var endAngle = pointInfo.endAngle;
      if (endAngle != null && startAngle != null&& endAngle < startAngle) {
        endAngle += Math.PI * 2;
      }
      if (startAngle != null && endAngle != null && pointInfo.circleRadius != null){
        var textAngle = (startAngle + endAngle) / 2 + (pointInfo.isReversed ? 1 : 0) * Math.PI;
        var textX = pointInfo.circleX + pointInfo.circleRadius * Math.cos(textAngle);
        var textY = pointInfo.circleY + pointInfo.circleRadius * Math.sin(textAngle);
        drawText(ctx, this.text, textX, textY, textAngle);
        // if(!transitionDeterminismCheck(this.startCircle,this.text)){
        //   this.text = "";
        //   alert("This transition fails the determinism check!");
        // }
      }
    } else {
      var textX = (pointInfo.startX + pointInfo.endX) / 2;
      var textY = (pointInfo.startY + pointInfo.endY) / 2;
      var textAngle = Math.atan2(pointInfo.endX - pointInfo.startX, pointInfo.startY - pointInfo.endY);
      drawText(ctx, this.text, textX, textY, textAngle + this.lineAngleAdjust);
      // if(!transitionDeterminismCheck(this.startCircle,this.text)){
      //   this.text = "";
      //   alert("This transition fails the determinism check!");

      // }
    }
    }

    containsPoint(x: number, y: number) {
        var stuff = this.getEndPointsAndCircle();
        if (stuff.hasCircle && stuff.circleX) {
            var dx = x - stuff.circleX;
            var dy = y - stuff.circleY;
            var distance = Math.sqrt(dx * dx + dy * dy) - stuff.circleRadius;
            if (Math.abs(distance) < hitTargetPadding) {
                var angle = Math.atan2(dy, dx);
                var startAngle = stuff.startAngle;
                var endAngle = stuff.endAngle;
                if (stuff.isReversed) {
                    var temp = startAngle;
                    startAngle = endAngle;
                    endAngle = temp;
                }
                if (endAngle < startAngle) {
                    endAngle += Math.PI * 2;
                }
                if (angle < startAngle) {
                    angle += Math.PI * 2;
                } else if (angle > endAngle) {
                    angle -= Math.PI * 2;
                }
                return (angle > startAngle && angle < endAngle);
            }
        } else {
        var dx = stuff.endX - stuff.startX;
        var dy = stuff.endY - stuff.startY;
        var length = Math.sqrt(dx * dx + dy * dy);
        var percent = (dx * (x - stuff.startX) + dy * (y - stuff.startY)) / (length * length);
        var distance = (dx * (y - stuff.startY) - dy * (x - stuff.startX)) / length;
        return (percent > 0 && percent < 1 && Math.abs(distance) < hitTargetPadding);
      }
      return false;
    }
  }
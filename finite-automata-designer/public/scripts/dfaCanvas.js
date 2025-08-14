(function () {
    'use strict';

    var nodeRadius = 30;
    var snapToPadding = 10; // pixels
    var hitTargetPadding = 6; // pixels
    // Creates subscript text to the input string using underscores before 0-9 as the regex
    function subscriptText(text) {
        var subscriptText = text;
        for (var i = 0; i < 10; i++) {
            subscriptText = subscriptText.replace(new RegExp('_' + i, 'g'), String.fromCharCode(8320 + i));
        }
        return subscriptText;
    }
    function drawText(ctx, originalText, x, y, angeOrNull) {
        ctx.font = '20px Times New Roman';
        var text = subscriptText(originalText);
        var width = ctx.measureText(text).width;
        x -= width / 2;
        if (angeOrNull != null) {
            var cos = Math.cos(angeOrNull);
            var sin = Math.sin(angeOrNull);
            var cornerPointX = (width / 2 + 5) * (cos > 0 ? 1 : -1);
            var cornerPointY = (10 + 5) * (sin > 0 ? 1 : -1);
            var slide = sin * Math.pow(Math.abs(sin), 40) * cornerPointX - cos * Math.pow(Math.abs(cos), 10) * cornerPointY;
            x += cornerPointX - sin * slide;
            y += cornerPointY + cos * slide;
        }
        x = Math.round(x);
        y = Math.round(y);
        ctx.fillText(text, x, y + 6);
    }
    function drawArrow(ctx, x, y, angle) {
        var dx = Math.cos(angle);
        var dy = Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 10 * dx + 5 * dy, y - 8 * dy - 5 * dx);
        ctx.lineTo(x - 10 * dx - 5 * dy, y - 8 * dy + 5 * dx);
        ctx.fill();
    }

    var circles = [];
    class Circle {
        constructor(x, y) {
            this.x = x,
                this.y = y;
            this.mouseOffsetX = 0;
            this.mouseOffsetY = 0;
            this.isAccept = false;
            this.text = '';
            this.outArrows = new Set();
            // this.inArrows = new Set();
            this.loop = null;
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

    var arrows = [];
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
    function circleFromThreePoints(x1, y1, x2, y2, x3, y3) {
        var a = det(x1, y1, 1, x2, y2, 1, x3, y3, 1);
        var bx = -det(x1 * x1 + y1 * y1, y1, 1, x2 * x2 + y2 * y2, y2, 1, x3 * x3 + y3 * y3, y3, 1);
        var by = det(x1 * x1 + y1 * y1, x1, 1, x2 * x2 + y2 * y2, x2, 1, x3 * x3 + y3 * y3, x3, 1);
        var c = -det(x1 * x1 + y1 * y1, x1, y1, x2 * x2 + y2 * y2, x2, y2, x3 * x3 + y3 * y3, x3, y3);
        return {
            'x': -bx / (2 * a),
            'y': -by / (2 * a),
            'radius': Math.sqrt(bx * bx + by * by - 4 * a * c) / (2 * Math.abs(a))
        };
    }
    function det(a, b, c, d, e, f, g, h, i) {
        return a * e * i + b * f * g + c * d * h - a * f * h - b * d * i - c * e * g;
    }
    class Arrow {
        constructor(startCircle, endCircle) {
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
        setAnchorPoint(x, y) {
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
        draw(ctx) {
            var pointInfo = this.getEndPointsAndCircle();
            // draw arc
            ctx.beginPath();
            if (pointInfo.hasCircle && pointInfo.circleX) {
                ctx.arc(pointInfo.circleX, pointInfo.circleY, pointInfo.circleRadius, pointInfo.startAngle, pointInfo.endAngle, pointInfo.isReversed);
            }
            else {
                ctx.moveTo(pointInfo.startX, pointInfo.startY);
                ctx.lineTo(pointInfo.endX, pointInfo.endY);
            }
            ctx.stroke();
            // draw the head of the arrow
            if (pointInfo.hasCircle && pointInfo.endAngle) {
                drawArrow(ctx, pointInfo.endX, pointInfo.endY, pointInfo.endAngle - pointInfo.reverseScale * (Math.PI / 2));
            }
            else {
                drawArrow(ctx, pointInfo.endX, pointInfo.endY, Math.atan2(pointInfo.endY - pointInfo.startY, pointInfo.endX - pointInfo.startX));
            }
            if (pointInfo.hasCircle) {
                var startAngle = pointInfo.startAngle;
                var endAngle = pointInfo.endAngle;
                if (endAngle != null && startAngle != null && endAngle < startAngle) {
                    endAngle += Math.PI * 2;
                }
                if (startAngle != null && endAngle != null && pointInfo.circleRadius != null) {
                    var textAngle = (startAngle + endAngle) / 2 + (pointInfo.isReversed ? 1 : 0) * Math.PI;
                    var textX = pointInfo.circleX + pointInfo.circleRadius * Math.cos(textAngle);
                    var textY = pointInfo.circleY + pointInfo.circleRadius * Math.sin(textAngle);
                    drawText(ctx, this.text, textX, textY, textAngle);
                    // if(!transitionDeterminismCheck(this.startCircle,this.text)){
                    //   this.text = "";
                    //   alert("This transition fails the determinism check!");
                    // }
                }
            }
            else {
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
        containsPoint(x, y) {
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
                    }
                    else if (angle > endAngle) {
                        angle -= Math.PI * 2;
                    }
                    return (angle > startAngle && angle < endAngle);
                }
            }
            else {
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

    class SelfArrow {
        constructor(pointsToCircle, point) {
            this.circle = pointsToCircle;
            this.startCircle = pointsToCircle;
            this.endCircle = pointsToCircle;
            this.circle.loop = this;
            this.anchorAngle = 0;
            this.mouseOffsetAngle = 0;
            this.text = '';
            this.transition = [];
            this.circle.outArrows.add(this);
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

    var startState = null;
    function setStartState(newEntryArrow) {
        startState = newEntryArrow;
    }
    class EntryArrow {
        // text: string;
        constructor(pointsToCircle, startPoint) {
            this.pointsToCircle = pointsToCircle;
            this.deltaX = 0;
            this.deltaY = 0;
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
            // Draw the text at the end without the arrow
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

    class TemporaryArrow {
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

    var alphabet = new Set(["0", "1"]);
    function setAlphabet(newAlphabet) {
        alphabet = newAlphabet;
    }

    // I haven't figured out how to stop compiling the imports into JS, so here's a command
    // to get rid of them once you cd into their directory lol:
    // rm alphabet.js && rm arrow.js && rm circle.js && rm draw.js && rm EntryArrow.js && rm SelfArrow.js
    // This is a "correctness" check: does the new transition coincide
    // with other transitions going out from that state? If it does,
    // then it fails determinism.
    function transitionDeterminismCheck(lastEditedArrow) {
        if (lastEditedArrow == null) {
            console.log("null");
            return;
        }
        else {
            alert("The transitionDeterminismCheck is running!!");
            console.log(lastEditedArrow.constructor.name);
        }
        // You don't want to check the transition for this current arrow
        // when iterating through all the arrows, so just empty it here.
        // If the transition is incorrect, then it'll remain empty.
        // If the transition is correct, then we'll reassign it to a new
        // value after all the checks.
        lastEditedArrow.transition = [];
        const newTransitions = lastEditedArrow.text.trim().split(",");
        console.log(newTransitions);
        if (lastEditedArrow instanceof Arrow) {
            // Check the outArrows of the initial node
            const startCircOutArrows = lastEditedArrow.startCircle.outArrows;
            // You iterate through every arrow that goes outwards from this current node
            for (let arrow of startCircOutArrows) {
                const oldTransitions = arrow.transition;
                // Then, you iterate through each of the old transitions for each arrow
                console.log("Old trans: " + oldTransitions);
                for (let oldTransition of oldTransitions) {
                    // Next, you iterate through each transition in the new
                    // transition, and compare it against each transition
                    // in the original transition for that arrow
                    for (let newTransition of newTransitions) {
                        // If a transition already exists, then it fails determinism
                        if (newTransition === oldTransition) {
                            lastEditedArrow.text = "";
                            alert("This translation violates determinism since " + newTransition + " is already present for an outgoing arrow of the start node of this arrow");
                            return false;
                        }
                    }
                }
            }
            // // Check the inArrows of the initial node
            // const startCircInArrows = lastEditedArrow.startCircle.inArrows;
            // for(let arrow of startCircInArrows){
            //   const oldTransitions = arrow.transition;
            //   for(let oldTransition of oldTransitions){
            //     for(let newTransition of newTransitions){
            //       if(newTransition === oldTransition){
            //         lastEditedArrow.text = "";
            //         alert("This translation violates determinism since " + newTransition + " is already present for an incoming arrow of the start node of this arrow");
            //         return false;
            //       }
            //     }
            //   }
            // }
            // Check the outArrows of the terminal node
            // const endCircOutArrows = lastEditedArrow.endCircle.outArrows;
            // for(let arrow of endCircOutArrows){
            //   const oldTransitions = arrow.transition;
            //   for(let oldTransition of oldTransitions){
            //     for(let newTransition of newTransitions){
            //       if(newTransition === oldTransition){
            //         lastEditedArrow.text = "";
            //         alert("This translation violates determinism since " + newTransition + " is already present for an outgoing arrow of the end node of this arrow");
            //         return false;
            //       }
            //     }
            //   }
            // }
            // Check the inArrows of the terminal node
            // const endCircInArrows = lastEditedArrow.endCircle.inArrows;
            // for(let arrow of endCircInArrows){
            //   const oldTransitions = arrow.transition;
            //   for(let oldTransition of oldTransitions){
            //     for(let newTransition of newTransitions){
            //       if(newTransition === oldTransition){
            //         lastEditedArrow.text = "";
            //         alert("This translation violates determinism since " + newTransition + " is already present for an incoming arrow of the end node of this arrow");
            //         return false;
            //       }
            //     }
            //   }
            // }
            // Check the loops for the start and end circles
            // const startCirc = lastEditedArrow.startCircle;
            // const endCirc = lastEditedArrow.endCircle;
            // if(startCirc.loop){
            //   const loopTransition = startCirc.loop.transition;
            //   for(let newTransition of newTransitions){
            //     if(newTransition in loopTransition){
            //       lastEditedArrow.text = "";
            //       alert("This translation violates determinism since " + newTransition + " is already present for the loop of the start node of this arrow");
            //       return false;
            //     }
            //   }
            // }
            // if(endCirc.loop){
            //   const loopTransition = endCirc.loop.transition;
            //   for(let newTransition of newTransitions){
            //     if(newTransition in loopTransition){
            //       lastEditedArrow.text = "";
            //       alert("This translation violates determinism since " + newTransition + " is already present for the loop of the end node of this arrow");
            //       return false;
            //     }
            //   }
            // }
            alert("This transition works!");
            lastEditedArrow.transition = newTransitions;
            return true;
        }
        else if (lastEditedArrow instanceof SelfArrow) {
            const circOutArrows = lastEditedArrow.circle.outArrows;
            for (let arrow of circOutArrows) {
                const oldTransitions = arrow.transition;
                console.log("Old trans: " + oldTransitions);
                for (let oldTransition of oldTransitions) {
                    for (let newTransition of newTransitions) {
                        if (newTransition === oldTransition) {
                            lastEditedArrow.text = "";
                            alert("This translation violates determinism since " + newTransition + " is already present for an outgoing arrow of the node of this looped arrow");
                            return false;
                        }
                    }
                }
            }
            // const circInArrows = lastEditedArrow.circle.inArrows;
            // for(let arrow of circInArrows){
            //   const oldTransitions = arrow.transition;
            //   for(let oldTransition of oldTransitions){
            //     for(let newTransition of newTransitions){
            //       if(newTransition === oldTransition){
            //         lastEditedArrow.text = "";
            //         alert("This translation violates determinism since " + newTransition + " is already present for an incoming arrow of the node of this looped arrow");
            //         return false;
            //       }
            //     }
            //   }
            // }
            alert("This transition works!");
            lastEditedArrow.transition = newTransitions;
            return true;
        }
        return true;
    }
    // This is a "completeness" check: were all characters of the
    // alphabet used when building the DFA? This is processed
    // every time we input a string.
    function inputDeterminismCheck() {
        // We iterate over every single state
        for (let node of circles) {
            // We retrieve the outgoing arrows from the current state
            const outArrows = node.outArrows;
            for (let char of alphabet) {
                // The "exists" variable will be used to track if
                // this specific character in the alphabet has been
                // used as a transition or not for this specific state
                var exists = false;
                // We iterate over all the outgoing arrows from the
                // current state
                for (let arrow of outArrows) {
                    // Then, for each arrow, we iterate over every
                    // transition for it.
                    for (let transition of arrow.transition) {
                        // If the current character in the alphabet
                        // does exist as a transition for this current
                        // state, then exists = true and we break out
                        // of this loop.
                        if (char === transition) {
                            exists = true;
                            break;
                        }
                        // If the transition does not exist in the alphabet,
                        // then immediately return false, since it violates
                        // determinism.
                        if (!alphabet.has(transition)) {
                            alert("Transition " + transition + " for state " + node.text + " has not been defined in the alphabet");
                            console.log("The transition in question: " + arrow.transition);
                            return false;
                        }
                    }
                }
                // If we iterated over all the transitions for all the outgoing
                // arrows of this state, and the current character in the alphabet
                // was not found to be a transition at all, then it fails determinism
                if (!exists) {
                    alert(char + " has not been implemented for this state: " + node.text + "; not all characters from alphabet were used");
                    console.log("The transitions:");
                    for (let arrow of node.outArrows) {
                        console.log(arrow.transition);
                    }
                    return false;
                }
            }
        }
        return true;
    }
    function dfaAlgo(input) {
        var acceptStateExists = false;
        for (let circle of circles) {
            if (circle.isAccept) {
                acceptStateExists = true;
                break;
            }
        }
        if (startState === null && !acceptStateExists) {
            alert("Start state and accept states are both undefined!");
            return false;
        }
        else if (startState === null) {
            alert("Start state undefined!");
            return false;
        }
        else if (!acceptStateExists) {
            alert("Accept state undefined!");
            return false;
        }
        // First, we make sure the input string is legal. If it contains
        // characters not defined in the alphabet, then we return false immediately.
        for (let char of input) {
            if (!alphabet.has(char)) {
                alert("Input contains \'" + char + "\', which is not in the alphabet");
                return false;
            }
        }
        // This "curr" variable will be used to traverse over the whole DFA
        var curr = startState.pointsToCircle;
        // We check if the DFA has been defined correctly. If not, then return false.
        if (!inputDeterminismCheck()) {
            return false;
        }
        // We begin traversing the input string.
        for (let char of input) {
            // We go through every outgoing arrow for the 
            // current state.
            const currOutArrows = curr.outArrows;
            console.log("Char: " + char);
            for (let arrow of currOutArrows) {
                console.log("At: " + curr.text);
                console.log("Transition: " + arrow.transition);
                // If the current character from the input string
                // is found in one of the transitions, then we 
                // use that transition to move to the next state.
                if (char in arrow.transition) {
                    console.log("Taking transition: " + arrow.transition);
                    curr = arrow.endCircle;
                    break;
                }
            }
        }
        console.log("At: " + curr.text);
        // If the final state that we arrived at is the end state,
        // that means the string was accepted.
        if (curr.isAccept) {
            alert("The string was accepted!");
            console.log("Accepted!");
            return true;
        }
        // Else, the final state we arrived at is not the end state,
        // which means the string was rejected.
        else {
            alert("The string was rejected!");
            console.log("Rejected!");
        }
    }

    // import { transitionDeterminismCheck } from "../../src/lib/dfa/dfa"
    // Command to compile this file into JS
    // npm run build:canvas
    var lastEditedObject = null;
    var selectedObj = null;
    var hightlightSelected = 'blue';
    var highlightTyping = 'red';
    var base = 'black';
    var dragging = false;
    var shiftPressed = false;
    var typingMode = false;
    var startClick = null;
    var tempArrow = null;
    function setupDfaCanvas(canvas) {
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        function draw() {
            if (!ctx)
                return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            // ctx?.translate(0.5, 0.5);
            for (var circle = 0; circle < circles.length; circle++) {
                ctx.lineWidth = 1;
                // If we're in typing mode, use the red highlight, else blue highlight
                ctx.fillStyle = ctx.strokeStyle = (circles[circle] == selectedObj) ? ((typingMode) ? highlightTyping : hightlightSelected) : base;
                circles[circle].draw(ctx);
            }
            for (var arrow = 0; arrow < arrows.length; arrow++) {
                ctx.lineWidth = 1;
                // If we're in typing mode, use the red highlight, else blue highlight
                ctx.fillStyle = ctx.strokeStyle = (arrows[arrow] == selectedObj) ? ((typingMode) ? highlightTyping : hightlightSelected) : base;
                arrows[arrow].draw(ctx);
            }
            if (startState) {
                ctx.lineWidth = 1;
                ctx.fillStyle = ctx.strokeStyle = (startState == selectedObj) ? hightlightSelected : base;
                startState.draw(ctx);
            }
            if (tempArrow != null) {
                ctx.lineWidth = 1;
                ctx.fillStyle = ctx.strokeStyle = base;
                tempArrow.draw(ctx);
            }
        }
        /* Event Handlers */
        canvas.addEventListener('mousedown', (event) => {
            event.preventDefault();
            var mouse = getMousePos(event);
            selectedObj = mouseCollision(mouse.x, mouse.y);
            dragging = false;
            startClick = mouse;
            switch (event.button) {
                case 0:
                    if (typingMode) {
                        // alert("transitionDeterminismCheck is running!!");
                        // If we left-click and the previous edited object was an Arrow or SelfArrow, run
                        // the transition check since it means the transition has been submitted
                        if (lastEditedObject instanceof Arrow || lastEditedObject instanceof SelfArrow) {
                            alert("transDetCheck 1 running!!");
                            transitionDeterminismCheck(lastEditedObject);
                        }
                        typingMode = false;
                    }
                    break;
                case 2:
                    if (selectedObj !== null && (selectedObj instanceof Arrow ||
                        selectedObj instanceof SelfArrow ||
                        selectedObj instanceof Circle)) {
                        // In the event that the user right clicks on something else that is NOT the previously edited
                        // arrow, then it will run the transitionDeterminismCheck and set typingMode to false, because
                        // it would indicate that the user has submitted
                        if (typingMode && (lastEditedObject instanceof Arrow || lastEditedObject instanceof SelfArrow) && selectedObj !== lastEditedObject) {
                            alert("transDetCheck 2 running!!");
                            transitionDeterminismCheck(lastEditedObject);
                            typingMode = false;
                        }
                        // Update the previously edited object
                        lastEditedObject = selectedObj;
                        // Set typing mode to true, since the object that was currently right-clicked on is an Arrow
                        // or SelfArrow or Circle, which means it can be typed on
                        typingMode = true;
                    }
                    // If the selected object is null (meaning nothing is selected) or if the currently selected object is
                    // not an Arrow or SelfArrow or Circle, then enter this else-block
                    else {
                        // If it is currently on typing mode and the previously edited object was an Arrow or SelfArrow,
                        // we will run the transitionDeterminismCheck, since right-clicking anything but an Arrow, SelfArrow,
                        // or Circle means the user has submitted their transition
                        if (typingMode && (lastEditedObject instanceof Arrow || lastEditedObject instanceof SelfArrow)) {
                            alert("transDetCheck 3 running!!");
                            transitionDeterminismCheck(lastEditedObject);
                            typingMode = false;
                        }
                    }
                    break;
            }
            if (selectedObj != null) {
                if (shiftPressed && selectedObj instanceof Circle) {
                    // Draw a SelfArrow to the selected circle
                    tempArrow = new SelfArrow(selectedObj, mouse);
                }
                else {
                    dragging = true;
                    if (selectedObj instanceof Circle || selectedObj instanceof SelfArrow) {
                        selectedObj.setMouseStart(mouse.x, mouse.y);
                    }
                }
            }
            else if (shiftPressed) {
                // Cosmetic arrow logic for interactive response
                tempArrow = new TemporaryArrow(mouse, mouse);
            }
            draw();
        });
        canvas.addEventListener('dblclick', (event) => {
            var mouse = getMousePos(event);
            selectedObj = mouseCollision(mouse.x, mouse.y);
            if (selectedObj == null) {
                selectedObj = new Circle(mouse.x, mouse.y);
                if (selectedObj instanceof Circle) {
                    circles.push(selectedObj);
                    draw();
                }
            }
            else if (selectedObj instanceof Circle) {
                selectedObj.isAccept = !selectedObj.isAccept;
                draw();
            }
        });
        canvas.addEventListener('mousemove', (event) => {
            var mouse = getMousePos(event);
            if (tempArrow != null) {
                var targetCircle = mouseCollision(mouse.x, mouse.y);
                if (!(targetCircle instanceof Circle)) {
                    targetCircle = null;
                }
                if (selectedObj == null && startClick != null) {
                    if (targetCircle != null && targetCircle instanceof Circle) {
                        tempArrow = new EntryArrow(targetCircle, startClick);
                    }
                    else {
                        tempArrow = new TemporaryArrow(startClick, mouse);
                    }
                }
                else {
                    if (targetCircle == selectedObj && targetCircle instanceof Circle) {
                        tempArrow = new SelfArrow(targetCircle, mouse);
                    }
                    else if (targetCircle != null && selectedObj instanceof Circle && targetCircle instanceof Circle) {
                        tempArrow = new Arrow(selectedObj, targetCircle);
                    }
                    else if (selectedObj instanceof Circle) {
                        tempArrow = new TemporaryArrow(selectedObj.closestPointOnCircle(mouse.x, mouse.y), mouse);
                    }
                }
                draw();
            }
            if (dragging) {
                selectedObj?.setAnchorPoint(mouse.x, mouse.y);
                if (selectedObj instanceof Circle) {
                    snapAlignCircle(selectedObj);
                }
                draw();
            }
        });
        canvas.addEventListener('mouseup', (event) => {
            dragging = false;
            if (tempArrow != null) {
                if (!(tempArrow instanceof TemporaryArrow)) {
                    // When adding the tempArrow to the arrows array, 
                    // Check if a self arrow points to the selected circle already
                    if (tempArrow instanceof SelfArrow) {
                        var hasSelfArrow = false;
                        for (var i = 0; i < arrows.length; i++) {
                            var arrow = arrows[i];
                            if (arrow instanceof SelfArrow) {
                                if (arrow.circle == selectedObj) {
                                    arrows.push(arrow);
                                    console.log(arrows);
                                    hasSelfArrow = true;
                                    break;
                                }
                            }
                        }
                        if (!hasSelfArrow) {
                            selectedObj = tempArrow;
                            arrows.push(tempArrow);
                            console.log(arrows);
                        }
                    }
                    else if (tempArrow instanceof EntryArrow) {
                        // var hasEntryArrow = false;
                        // for (var i = 0; i < arrows.length; i++) {
                        //   if (arrows[i] instanceof EntryArrow) {
                        //     hasEntryArrow = true;
                        //     break;
                        //   }
                        // }
                        if (startState === null) {
                            selectedObj = tempArrow;
                            setStartState(tempArrow);
                            // arrows.push(tempArrow);
                            console.log("Curr arrows" + arrows);
                        }
                    }
                    else {
                        selectedObj = tempArrow;
                        arrows.push(tempArrow);
                        console.log(arrows);
                    }
                }
                tempArrow = null;
            }
            draw();
        });
        // This disables the default context menu on the canvas, since it was getting annoying
        // having to press Esc every time I right-clicked on an object when I wanted to type.
        canvas.addEventListener('contextmenu', event => event.preventDefault());
        // Whenever a key is pressed on the user's keyboard
        document.addEventListener('keydown', (event) => {
            // If the "Shift" key is pressed, set
            // shiftPressed = true, since it'll be used for
            // other functions on the canvas.
            if (event.key === 'Shift') {
                shiftPressed = true;
            }
            // If we are currently selecting an object AND
            // if the currently selected object has a "text"
            // attribute, we will enter this if-statement
            if (selectedObj != null) {
                if ('text' in selectedObj) {
                    // This is for backspacing one letter at a time
                    if (event.key === 'Backspace' && typingMode) {
                        selectedObj.text = selectedObj.text.substring(0, selectedObj.text.length - 1);
                        draw();
                    }
                    else {
                        // If a key of length 1 was pressed (such as a number or
                        // letter), we will append that character to the end of the 
                        // "text" attribute of that object, which will then be 
                        // displayed on the canvas
                        if (event.key.length === 1 && typingMode) {
                            // If the current object that is being typed on is an Arrow or SelfArrow,
                            // then we will check if the character being typed is defined in the alphabet.
                            // If not, we will alert the user.
                            if (selectedObj instanceof Arrow || selectedObj instanceof SelfArrow) {
                                if (alphabet.has(event.key) || event.key === ',') {
                                    selectedObj.text += event.key;
                                }
                                else {
                                    console.log(alphabet);
                                    console.log(event.key.constructor.name);
                                    alert(event.key + " is not defined in the alphabet!");
                                }
                            }
                            else {
                                selectedObj.text += event.key;
                            }
                            // After the new character has been appended to the object's
                            // "text" attribute, we will draw the canvas again
                            draw();
                        }
                    }
                }
                // If the "Delete" key is pressed on your keyboard
                if (event.key === 'Delete') {
                    // Iterate through all circles that are present
                    for (var circ = 0; circ < circles.length; circ++) {
                        // If a circle is selected when "Delete" is pressed, 
                        // then delete that specific circle
                        if (circles[circ] == selectedObj) {
                            circles.splice(circ--, 1);
                        }
                    }
                    if (startState == selectedObj || startState?.pointsToCircle == selectedObj) {
                        setStartState(null);
                    }
                    // Iterate through all arrows that are present
                    for (var i = 0; i < arrows.length; i++) {
                        const arrow = arrows[i];
                        // If an arrow is selected when "Delete" is pressed,
                        // then delete that specific arrow
                        if (arrow == selectedObj) {
                            deleteArrow(arrow, i--);
                        }
                        // If an arrow is a SelfArrow (looped arrow)
                        if (arrow instanceof SelfArrow) {
                            // If the circle that the SelfArrow is looped
                            // on is the object being currently selected, then
                            // delete that SelfArrow as well since its associated
                            // circle is being deleted
                            if (arrow.circle == selectedObj) {
                                deleteArrow(arrow, i--);
                            }
                        }
                        // // If an arrow is an EntryArrow
                        // if (arrow instanceof EntryArrow) {
                        //   // If the circle that the EntryArrow is being
                        //   // pointed to is the object being currently selected,
                        //   // then delete that EntryArrow as well since its
                        //   // associated circle is being deleted
                        //   if (arrow.pointsToCircle == selectedObj) {
                        //     deleteArrow(arrow,i--);
                        //   }
                        // }
                        // If an arrow is a regular Arrow
                        if (arrow instanceof Arrow) {
                            // If either the startCircle or the endCircle of
                            // this Arrow is the object being currently selected,
                            // then delete the Arrow, since it will no longer
                            // have two safe endpoints to be connected to
                            if (arrow.startCircle == selectedObj || arrow.endCircle == selectedObj) {
                                deleteArrow(arrow, i--);
                            }
                        }
                    }
                    // After all the arrows and circles present have been
                    // checked, we can draw the canvas again
                    draw();
                    console.log(arrows);
                }
            }
        });
        // Note to self: define inputString and alphabet down in the function at the bottom of
        // this page. It will make it easier to finish this code.
        // inputString.addEventListener("input", () => {
        //       console.log("Input String:", inputString.value);
        //     });
        //   }
        //   if (alphabet) {
        //     alphabet.addEventListener("input", () => {
        //       console.log("Alphabet:", alphabet.value);
        //     });
        //   }
        // });
        // If the arrow is being deleted, then update the
        // circles that it is associated with
        function deleteArrow(arrow, index) {
            if (arrow instanceof Arrow) {
                arrow.startCircle.outArrows.delete(arrow);
                // arrow.endCircle.inArrows.delete(arrow);
            }
            else if (arrow instanceof SelfArrow) {
                arrow.circle.outArrows.delete(arrow);
                arrow.circle.loop = null;
            }
            arrows.splice(index, 1);
        }
        document.addEventListener('keyup', (event) => {
            if (event.key === 'Shift') {
                shiftPressed = false;
            }
        });
        /* Helper Functions*/
        // Align the input circle to any circle in the array if x or y absolute is less than padding
        function snapAlignCircle(circle) {
            for (var circ = 0; circ < circles.length; circ++) {
                if (circles[circ] == circle)
                    continue;
                if (Math.abs(circle.x - circles[circ].x) < snapToPadding) {
                    circle.x = circles[circ].x;
                }
                if (Math.abs(circle.y - circles[circ].y) < snapToPadding) {
                    circle.y = circles[circ].y;
                }
            }
        }
        // Get the current mouse position inside the canvas
        const getMousePos = (event) => {
            const rect = canvas.getBoundingClientRect();
            return { x: event.clientX - rect.left, y: event.clientY - rect.top };
        };
        // Get the collided object at the point x, y
        function mouseCollision(x, y) {
            for (var circ = 0; circ < circles.length; circ++) {
                if (circles[circ].containsPoint(x, y)) {
                    return circles[circ];
                }
            }
            for (var arrow = 0; arrow < arrows.length; arrow++) {
                if (arrows[arrow].containsPoint(x, y)) {
                    return arrows[arrow];
                }
            }
            if (startState && startState.containsPoint(x, y)) {
                return startState;
            }
            return null;
        }
    }
    /* -----------------------------------------------------------
     * Attach automatically when DOM is ready.
     * --------------------------------------------------------- */
    function attachWhenReady() {
        const run = () => {
            const inputString = document.getElementById("inputString");
            const alphabetInput = document.getElementById("alphabet");
            const canvas = document.getElementById('DFACanvas');
            if (canvas) {
                setupDfaCanvas(canvas);
            }
            if (inputString) {
                inputString.addEventListener("keydown", (event) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        console.log("Submitting inputString:", inputString.value);
                        var newInput = inputString.value;
                        for (let char of newInput) {
                            if (!alphabet.has(char)) {
                                // Note to self: maybe make it so it goes through the entire string
                                // first and collects every character that is wrong? Then give an alert
                                // afterwards with every character that was wrong
                                alert(char + " is not in the alphabet, this input is invalid!");
                                break;
                            }
                        }
                        // Add code to run DFA algo stuff below:
                        dfaAlgo(newInput);
                        // put your handling logic here
                        inputString.value = ""; // optional clear
                    }
                });
            }
            if (alphabetInput) {
                alphabetInput.addEventListener("keydown", (event) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        console.log("Submitting alphabet:", alphabetInput.value);
                        const newAlphabet = new Set(alphabetInput.value.trim().split(","));
                        setAlphabet(newAlphabet);
                        console.log(alphabet);
                        // put your handling logic here
                        alphabetInput.value = ""; // optional clear
                    }
                });
            }
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', run);
        }
        else {
            run(); // DOM is already ready
        }
    }
    attachWhenReady();

})();

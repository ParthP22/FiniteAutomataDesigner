var DfaCanvas = (function (exports) {
    'use strict';

    var nodeRadius = 30;
    var selectedObj$1 = null;
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
    function drawText(ctx, originalText, x, y, angeOrNull, isSelected) {
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
    var Circle = /** @class */ (function () {
        function Circle(x, y) {
            this.x = x,
                this.y = y;
            this.mouseOffsetX = 0;
            this.mouseOffsetY = 0;
            this.isAccept = false;
            this.text = '';
            this.outArrows = [];
            this.loop = false;
        }
        Circle.prototype.setMouseStart = function (x, y) {
            this.mouseOffsetX = this.x - x;
            this.mouseOffsetY = this.y - y;
        };
        Circle.prototype.setAnchorPoint = function (x, y) {
            this.x = x + this.mouseOffsetX;
            this.y = y + this.mouseOffsetY;
        };
        Circle.prototype.draw = function (ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, nodeRadius, 0, 2 * Math.PI, false);
            ctx.stroke();
            drawText(ctx, this.text, this.x, this.y, null);
            if (this.isAccept) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, nodeRadius - 5, 0, 2 * Math.PI, false);
                ctx.stroke();
            }
        };
        Circle.prototype.closestPointOnCircle = function (x, y) {
            var dx = x - this.x;
            var dy = y - this.y;
            var scale = Math.sqrt(dx * dx + dy * dy);
            return {
                'x': this.x + dx * nodeRadius / scale,
                'y': this.y + dy * nodeRadius / scale
            };
        };
        Circle.prototype.containsPoint = function (x, y) {
            return (x - this.x) * (x - this.x) + (y - this.y) * (y - this.y) < nodeRadius * nodeRadius;
        };
        return Circle;
    }());

    var arrows = [];
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
    var Arrow = /** @class */ (function () {
        function Arrow(startCircle, endCircle) {
            this.startCircle = startCircle;
            this.endCircle = endCircle;
            startCircle.outArrows.push(this);
            this.text = '';
            this.lineAngleAdjust = 0;
            // Make anchor point relative to the locations of start and end circles
            this.parallelPart = 0.5; // percent from start to end circle
            this.perpendicularPart = 0; // pixels from start to end circle
            this.transition = [];
        }
        Arrow.prototype.getAnchorPoint = function () {
            var dx = this.endCircle.x - this.startCircle.x;
            var dy = this.endCircle.y - this.startCircle.y;
            var scale = Math.sqrt(dx * dx + dy * dy);
            return {
                'x': this.startCircle.x + dx * this.parallelPart - dy * this.perpendicularPart / scale,
                'y': this.startCircle.y + dy * this.parallelPart + dx * this.perpendicularPart / scale
            };
        };
        Arrow.prototype.setAnchorPoint = function (x, y) {
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
        };
        Arrow.prototype.getEndPointsAndCircle = function () {
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
        };
        Arrow.prototype.draw = function (ctx) {
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
        };
        Arrow.prototype.containsPoint = function (x, y) {
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
        };
        return Arrow;
    }());

    var SelfArrow = /** @class */ (function () {
        function SelfArrow(pointsToCircle, point) {
            this.circle = pointsToCircle;
            this.circle.loop = true;
            this.anchorAngle = 0;
            this.mouseOffsetAngle = 0;
            this.text = '';
            this.transition = [];
            if (point) {
                this.setAnchorPoint(point.x, point.y);
            }
        }
        SelfArrow.prototype.draw = function (ctx) {
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
        };
        SelfArrow.prototype.setMouseStart = function (x, y) {
            this.mouseOffsetAngle = this.anchorAngle - Math.atan2(y - this.circle.y, x - this.circle.x);
        };
        SelfArrow.prototype.setAnchorPoint = function (x, y) {
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
        };
        SelfArrow.prototype.getEndPointsAndCircle = function () {
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
        };
        SelfArrow.prototype.containsPoint = function (x, y) {
            var stuff = this.getEndPointsAndCircle();
            var dx = x - stuff.circleX;
            var dy = y - stuff.circleY;
            var distance = Math.sqrt(dx * dx + dy * dy) - stuff.circleRadius;
            return (Math.abs(distance) < hitTargetPadding);
        };
        return SelfArrow;
    }());

    var EntryArrow = /** @class */ (function () {
        function EntryArrow(pointsToCircle, startPoint) {
            this.pointsToCircle = pointsToCircle;
            this.deltaX = 0;
            this.deltaY = 0;
            this.text = '';
            if (startPoint) {
                this.setAnchorPoint(startPoint.x, startPoint.y);
            }
        }
        EntryArrow.prototype.draw = function (ctx) {
            var points = this.getEndPoints();
            ctx.beginPath();
            ctx.moveTo(points.startX, points.startY);
            ctx.lineTo(points.endX, points.endY);
            ctx.stroke();
            // Draw the text at the end without the arrow
            var textAngle = Math.atan2(points.startY - points.endY, points.startX - points.endX);
            drawText(ctx, this.text, points.startX, points.startY, textAngle);
            // Draw the head of the arrow
            drawArrow(ctx, points.endX, points.endY, Math.atan2(-this.deltaY, -this.deltaX));
        };
        EntryArrow.prototype.setAnchorPoint = function (x, y) {
            this.deltaX = x - this.pointsToCircle.x;
            this.deltaY = y - this.pointsToCircle.y;
            if (Math.abs(this.deltaX) < snapToPadding)
                this.deltaX = 0;
            if (Math.abs(this.deltaY) < snapToPadding)
                this.deltaY = 0;
        };
        EntryArrow.prototype.getEndPoints = function () {
            var startX = this.pointsToCircle.x + this.deltaX;
            var startY = this.pointsToCircle.y + this.deltaY;
            var end = this.pointsToCircle.closestPointOnCircle(startX, startY);
            return {
                'startX': startX,
                'startY': startY,
                'endX': end.x,
                'endY': end.y,
            };
        };
        EntryArrow.prototype.containsPoint = function (x, y) {
            var lineInfo = this.getEndPoints();
            var dx = lineInfo.endX - lineInfo.startX;
            var dy = lineInfo.endY - lineInfo.startY;
            var length = Math.sqrt(dx * dx + dy * dy);
            var percent = (dx * (x - lineInfo.startX) + dy * (y - lineInfo.startY)) / (length * length);
            var distance = (dx * (y - lineInfo.startY) - dy * (x - lineInfo.startX)) / length;
            return (percent > 0 && percent < 1 && Math.abs(distance) < hitTargetPadding);
        };
        return EntryArrow;
    }());

    var TemporaryArrow = /** @class */ (function () {
        function TemporaryArrow(startPoint, endPoint) {
            this.startPoint = startPoint;
            this.endPoint = endPoint;
        }
        TemporaryArrow.prototype.draw = function (ctx) {
            ctx.beginPath();
            ctx.moveTo(this.endPoint.x, this.endPoint.y);
            ctx.lineTo(this.startPoint.x, this.startPoint.y);
            ctx.stroke();
            drawArrow(ctx, this.endPoint.x, this.endPoint.y, Math.atan2(this.endPoint.y - this.startPoint.y, this.endPoint.x - this.startPoint.x));
        };
        return TemporaryArrow;
    }());

    // import { transitionDeterminismCheck } from "../../src/lib/dfa/dfa"
    // Command to compile this file into JS
    // npm run build:canvas
    // Cannot assign the import itself, so I'm setting it as a new variable here
    var selectedObj = selectedObj$1;
    var highlight = 'blue';
    var base = 'black';
    var dragging = false;
    var shiftPressed = false;
    var startClick = null;
    var tempArrow = null;
    var alphabet = ["0", "1"];
    // function transitionDeterminismCheck(circle: Circle, newTransition: string){
    //     const transition = newTransition.trim().split(",");
    //     circle.outArrows.forEach((arrow: Arrow) => {
    //         const oldTransition = arrow.transition;
    //         oldTransition.forEach((oldTransition: string) => {
    //             transition.forEach((newTransition: string) => {
    //                 if(newTransition === oldTransition){
    //                     return false;
    //                 }
    //             });
    //         });
    //     });
    //     return true;
    // }
    // function inputDeterminismCheck(input: string){
    //   for(let char of input){
    //     if(!(char in alphabet)){
    //       alert("Input contains " + char + ", which is not in the alphabet!");
    //       return false;
    //     }
    //   }
    //   for(let node of circles){
    //     const outArrows = node.outArrows;
    //     for(let char of alphabet){
    //       var exists: boolean = false;
    //       for(let arrow of outArrows){
    //         for(let transition of arrow.transition){
    //           if (char === transition){
    //             exists = true;
    //             break;
    //           }
    //           if(!(transition in alphabet)){
    //             alert("Transition " + transition + "for state " + node + " has not been defined in the alphabet");
    //             return false;
    //           }
    //         }
    //       }
    //       if(!exists){
    //         alert(char + " has not been implemented for this state: " + node + "; not all characters from alphabet were used");
    //         return false;
    //       }
    //     }
    //   }
    //   return true;
    // }
    function setupDfaCanvas(canvas) {
        var ctx = canvas.getContext('2d');
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
                ctx.fillStyle = ctx.strokeStyle = (circles[circle] == selectedObj) ? highlight : base;
                circles[circle].draw(ctx);
            }
            for (var arrow = 0; arrow < arrows.length; arrow++) {
                ctx.lineWidth = 1;
                ctx.fillStyle = ctx.strokeStyle = (arrows[arrow] == selectedObj) ? highlight : base;
                arrows[arrow].draw(ctx);
            }
            if (tempArrow != null) {
                ctx.lineWidth = 1;
                ctx.fillStyle = ctx.strokeStyle = base;
                tempArrow.draw(ctx);
            }
        }
        /* Event Handlers */
        canvas.addEventListener('mousedown', function (event) {
            var mouse = getMousePos(event);
            selectedObj = mouseCollision(mouse.x, mouse.y);
            dragging = false;
            startClick = mouse;
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
        canvas.addEventListener('dblclick', function (event) {
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
        canvas.addEventListener('mousemove', function (event) {
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
                selectedObj === null || selectedObj === void 0 ? void 0 : selectedObj.setAnchorPoint(mouse.x, mouse.y);
                if (selectedObj instanceof Circle) {
                    snapAlignCircle(selectedObj);
                }
                draw();
            }
        });
        canvas.addEventListener('mouseup', function (event) {
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
                                    hasSelfArrow = true;
                                    break;
                                }
                            }
                        }
                        if (!hasSelfArrow) {
                            selectedObj = tempArrow;
                            arrows.push(tempArrow);
                        }
                    }
                    else if (tempArrow instanceof EntryArrow) {
                        var hasEntryArrow = false;
                        for (var i = 0; i < arrows.length; i++) {
                            if (arrows[i] instanceof EntryArrow) {
                                hasEntryArrow = true;
                                break;
                            }
                        }
                        if (!hasEntryArrow) {
                            selectedObj = tempArrow;
                            arrows.push(tempArrow);
                        }
                    }
                    else {
                        selectedObj = tempArrow;
                        arrows.push(tempArrow);
                    }
                }
                tempArrow = null;
            }
            draw();
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Shift') {
                shiftPressed = true;
            }
            if (selectedObj != null && 'text' in selectedObj) {
                if (event.key === 'Backspace') {
                    selectedObj.text = selectedObj.text.substring(0, selectedObj.text.length - 1);
                    draw();
                }
                else if (event.key === 'Delete') {
                    for (var circ = 0; circ < circles.length; circ++) {
                        if (circles[circ] == selectedObj) {
                            circles.splice(circ--, 1);
                        }
                    }
                    for (var i = 0; i < arrows.length; i++) {
                        var arrow = arrows[i];
                        if (arrow == selectedObj) {
                            arrows.splice(i--, 1);
                        }
                        if (arrow instanceof SelfArrow) {
                            if (arrow.circle == selectedObj) {
                                arrows.splice(i--, 1);
                            }
                        }
                        if (arrow instanceof EntryArrow) {
                            if (arrow.pointsToCircle == selectedObj) {
                                arrows.splice(i--, 1);
                            }
                        }
                        if (arrow instanceof Arrow) {
                            if (arrow.startCircle == selectedObj || arrow.endCircle == selectedObj) {
                                arrows.splice(i--, 1);
                            }
                        }
                    }
                    draw();
                }
                else {
                    if (event.key.length === 1) {
                        selectedObj.text += event.key;
                        draw();
                    }
                }
            }
        });
        document.addEventListener('keyup', function (event) {
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
        var getMousePos = function (event) {
            var rect = canvas.getBoundingClientRect();
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
            return null;
        }
    }
    /* -----------------------------------------------------------
     * Attach automatically when DOM is ready.
     * --------------------------------------------------------- */
    function attachWhenReady() {
        var run = function () {
            var canvas = document.getElementById('DFACanvas');
            if (canvas) {
                setupDfaCanvas(canvas);
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

    exports.alphabet = alphabet;

    return exports;

})({});

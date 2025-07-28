var nodeRadius = 30;
var highlight = 'blue';
var base = 'black';
var dragging = false;
var shiftPressed = false;
var startClick = null;
var tempArrow = null;
var selectedObj = null;
var circles = [];
var arrows = [];
var snapToPadding = 10; // pixels
function drawText(ctx, originalText, x, y, angeOrNull, isSelected) {
    ctx.font = '20px Times New Roman', 'serif';
    var width = ctx.measureText(originalText).width;
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
    ctx.fillText(originalText, x, y + 6);
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
var Circle = /** @class */ (function () {
    function Circle(x, y) {
        this.x = x,
            this.y = y;
        this.mouseOffsetX = 0;
        this.mouseOffsetY = 0;
        this.isAccept = false;
        this.text = '';
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
        drawText(ctx, this.text, this.x, this.y, null, selectedObj == this);
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
    EntryArrow.prototype.draw = function (ctx) {
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
    };
    return EntryArrow;
}());
var StartArrow = /** @class */ (function () {
    function StartArrow() {
    }
    StartArrow.prototype.draw = function (ctx) {
    };
    StartArrow.prototype.setAnchorPoint = function (x, y) {
    };
    return StartArrow;
}());
var SelfArrow = /** @class */ (function () {
    function SelfArrow() {
    }
    SelfArrow.prototype.draw = function (ctx) {
    };
    SelfArrow.prototype.setMouseStart = function (x, y) {
    };
    SelfArrow.prototype.setAnchorPoint = function (x, y) {
    };
    return SelfArrow;
}());
var Arrow = /** @class */ (function () {
    function Arrow() {
    }
    Arrow.prototype.draw = function (ctx) {
    };
    Arrow.prototype.setAnchorPoint = function (x, y) {
    };
    return Arrow;
}());
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
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Shift') {
            shiftPressed = true;
        }
    });
    document.addEventListener('keyup', function (event) {
        if (event.key === 'Shift') {
            shiftPressed = false;
        }
    });
    /* Event Handlers */
    canvas.addEventListener('mousedown', function (event) {
        var mouse = getMousePos(event);
        selectedObj = mouseCollision(mouse.x, mouse.y);
        dragging = false;
        startClick = mouse;
        if (selectedObj != null) {
            if (shiftPressed && selectedObj instanceof Circle) {
                // self link logic
            }
            else {
                dragging = true;
                if (selectedObj instanceof Circle || selectedObj instanceof SelfArrow) {
                    selectedObj.setMouseStart(mouse.x, mouse.y);
                }
            }
        }
        else if (shiftPressed) {
            // cosmetic arrow logic for users
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
            // Handle snapping the arrow to circles (later)
            if (startClick != null) {
                tempArrow = new TemporaryArrow(startClick, mouse);
                draw();
            }
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
            tempArrow = null;
        }
        draw();
    });
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
    /* Helpers */
    var getMousePos = function (event) {
        var rect = canvas.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    function mouseCollision(x, y) {
        for (var circ = 0; circ < circles.length; circ++) {
            if (circles[circ].containsPoint(x, y)) {
                return circles[circ];
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
        ;
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    }
    else {
        run(); // DOM is already ready
    }
}
attachWhenReady();

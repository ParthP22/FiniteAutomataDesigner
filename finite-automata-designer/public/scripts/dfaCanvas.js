var nodeRadius = 30;
var selectedObj = null;
var circles = [];
var arrows = [];
function drawText(ctx, originalText, x, y, angeOrNull) {
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
function setupDfaCanvas(canvas) {
    var ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    function draw() {
        ctx === null || ctx === void 0 ? void 0 : ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx === null || ctx === void 0 ? void 0 : ctx.save();
        // ctx?.translate(0.5, 0.5);
        for (var circle = 0; circle < circles.length; circle++) {
            if (ctx)
                circles[circle].draw(ctx);
        }
    }
    // /* Event Handlers */
    //   canvas.addEventListener('mousedown', (ev: MouseEvent) => {
    //   isDragging = true;
    //   dragStart = getMousePos(ev);
    //   console.log("mouse down called")
    //   draw();
    // });
    canvas.addEventListener('dblclick', function (ev) {
        var mouse = getMousePos(ev);
        selectedObj = selectObject(mouse.x, mouse.y);
        if (selectedObj == null) {
            selectedObj = new Circle(mouse.x, mouse.y);
            circles.push(selectedObj);
            draw();
        }
        else if (selectedObj instanceof Circle) {
            selectedObj.isAccept = !selectedObj.isAccept;
            draw();
        }
    });
    // canvas.addEventListener('mousemove', (ev) => {
    //   if (!isDragging) return;
    //   const { x, y } = getMousePos(ev);
    //   ctx.clearRect(0, 0, canvas.width, canvas.height);
    //   ctx.beginPath();
    //   ctx.moveTo(dragStart.x, dragStart.y);
    //   ctx.lineTo(x, y);
    //   ctx.stroke();
    // });
    // canvas.addEventListener('mouseup', () => (isDragging = false));
    // /* ---------- example state ----------- */
    // let isDragging = false;
    // let dragStart = { x: 0, y: 0 };
    /* ---------- helpers ----------- */
    var getMousePos = function (ev) {
        var rect = canvas.getBoundingClientRect();
        return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
    };
    function selectObject(x, y) {
        for (var circ = 0; circ < circles.length; circ++) {
            if (circles[circ].containsPoint(x, y)) {
                console.log("hit!");
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

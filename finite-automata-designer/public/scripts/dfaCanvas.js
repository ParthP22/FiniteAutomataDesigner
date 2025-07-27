// dfaCanvas.ts   (put this anywhere in your project, e.g. /src/canvas)
function setupDfaCanvas(canvas) {
    var ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    /* ---------- example state ----------- */
    var isDragging = false;
    var dragStart = { x: 0, y: 0 };
    /* ---------- helpers ----------- */
    var getMousePos = function (ev) {
        var rect = canvas.getBoundingClientRect();
        return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
    };
    /* ---------- event handlers ----------- */
    canvas.addEventListener('dblclick', function (ev) {
        var _a = getMousePos(ev), x = _a.x, y = _a.y;
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fillStyle = 'skyblue';
        ctx.fill();
        ctx.stroke();
    });
    canvas.addEventListener('mousedown', function (ev) {
        isDragging = true;
        dragStart = getMousePos(ev);
    });
    canvas.addEventListener('mousemove', function (ev) {
        if (!isDragging)
            return;
        var _a = getMousePos(ev), x = _a.x, y = _a.y;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(dragStart.x, dragStart.y);
        ctx.lineTo(x, y);
        ctx.stroke();
    });
    canvas.addEventListener('mouseup', function () { return (isDragging = false); });
}
/* -----------------------------------------------------------
 * Attach automatically when DOM is ready.
 * --------------------------------------------------------- */
function attachWhenReady() {
    var run = function () {
        var canvas = document.getElementById('DFACanvas');
        if (canvas)
            setupDfaCanvas(canvas);
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    }
    else {
        run(); // DOM is already ready
    }
}
attachWhenReady();

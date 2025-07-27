var nodeRadius = 30;
var highlight = 'blue';
var base = 'black';
var dragging = false;
var shiftPressed = false;
var startClick: {x: number, y: number} | null = null;
var tempArrow: TemporaryArrow | null = null;
var selectedObj: Circle | null = null;
var circles: Circle[] = [];
var arrows = [];
var snapToPadding = 10; // pixels

function drawText(
  ctx: CanvasRenderingContext2D,
  originalText: string,
  x: number,
  y: number,
  angeOrNull: number | null
) {
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

function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) {
  var dx = Math.cos(angle);
  var dy = Math.sin(angle);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - 10 * dx + 5 * dy, y - 8 * dy - 5 * dx);
  ctx.lineTo(x - 10 * dx - 5 *dy, y - 8 * dy + 5 * dx);
  ctx.fill();
}

class Circle {
  x: number;
  y: number;
  mouseOffsetX: number;
  mouseOffsetY: number;
  isAccept: boolean;
  text: string;

  constructor(x: number, y: number) {
    this.x = x,
    this.y = y;
    this.mouseOffsetX = 0;
    this.mouseOffsetY = 0;
    this.isAccept = false;
    this.text = '';
  }

  setMouseStart(x: number, y: number): void {
    this.mouseOffsetX = this.x - x;
    this.mouseOffsetY = this.y - y;
  }

  setAnchorPoint(x: number, y: number): void {
    this.x = x + this.mouseOffsetX;
    this.y = y + this.mouseOffsetY;
  }

  draw(ctx: CanvasRenderingContext2D) {
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

  closestPointOnCircle(x: number, y: number) {
    var dx = x - this.x;
    var dy = y - this.y;
    var scale = Math.sqrt(dx * dx + dy * dy);
    return {
      'x': this.x + dx * nodeRadius / scale,
      'y': this.y + dy * nodeRadius / scale
    }
  }

  containsPoint(x: number, y: number) {
    return (x - this.x) * (x - this.x) + (y - this.y) * (y - this.y) < nodeRadius * nodeRadius;
  }
}

class TemporaryArrow {
  startPoint: {x: number, y: number};
  endPoint: {x: number, y: number};


  constructor(startPoint: {x: number, y: number}, endPoint: {x: number, y: number}) {
    this.startPoint = startPoint;
    this.endPoint = endPoint;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(this.endPoint.x, this.endPoint.y);
    ctx.lineTo(this.startPoint.x, this.startPoint.y);
    ctx.stroke();

    drawArrow(
      ctx, 
      this.endPoint.x, 
      this.endPoint.y, 
      Math.atan2(this.endPoint.y - this.startPoint.y, this.endPoint.x - this.startPoint.x)
    );
  }
}

function setupDfaCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    // ctx?.translate(0.5, 0.5);

    for (var circle = 0; circle < circles.length; circle++) {
      ctx.lineWidth= 1;
      ctx.fillStyle = ctx.strokeStyle = (circles[circle] == selectedObj) ? highlight : base;
      circles[circle].draw(ctx);
    }

    if (tempArrow != null) {
      ctx.lineWidth = 1;
      ctx.fillStyle = ctx.strokeStyle = base;
      tempArrow.draw(ctx);
    }
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Shift') {
      shiftPressed = true;

    }
  });

  document.addEventListener('keyup', (event) => {
    if (event.key === 'Shift') {
      shiftPressed = false;
    }
  })


  /* Event Handlers */
  canvas.addEventListener('mousedown', (event: MouseEvent) => {
    var mouse = getMousePos(event)
    selectedObj = mouseCollision(mouse.x, mouse.y);
    dragging = false;
    startClick = mouse;
    console.log(startClick);

    if (selectedObj != null) {
      if (shiftPressed && selectedObj instanceof Circle) {
        // self link logic
      } else {
        dragging = true;
        // if (selectedObj.setAnchorPoint) {
          
        // }
        selectedObj.setMouseStart(mouse.x, mouse.y);
      }
    } else if (shiftPressed) {
      // cosmetic arrow logic for users
      tempArrow = new TemporaryArrow(mouse, mouse);
    }

    draw();
  });


  canvas.addEventListener('dblclick', (event) => {
    var mouse = getMousePos(event);
    selectedObj = mouseCollision(mouse.x, mouse.y);

    if (selectedObj == null) {
      selectedObj = new Circle(mouse.x, mouse.y);
      circles.push(selectedObj);
      draw();
    } else if (selectedObj instanceof Circle) {
      selectedObj.isAccept = !selectedObj.isAccept;
      draw();
    }
    
  });

  canvas.addEventListener('mousemove', (event) => {
    var mouse = getMousePos(event);

    if (tempArrow != null) {
      // Handle snapping the arrow to circles (later)
      if (startClick != null) {
        console.log(startClick);
        tempArrow = new TemporaryArrow(startClick, mouse);
        draw();
      }
    }

    if (dragging) {
      selectedObj?.setAnchorPoint(mouse.x, mouse.y);
      if (selectedObj instanceof Circle) {
        snapAlignCircle(selectedObj);
      }
      draw();
    }
  });

  canvas.addEventListener('mouseup', (event) =>{
    dragging = false;

    if (tempArrow != null) {
      tempArrow = null;
    }

    draw();
  });


  function snapAlignCircle(circle: Circle) {
    for(var circ = 0; circ < circles.length; circ++) {
      if(circles[circ] == circle) continue;

      if(Math.abs(circle.x - circles[circ].x) < snapToPadding) {
        circle.x = circles[circ].x;
      }

      if(Math.abs(circle.y - circles[circ].y) < snapToPadding) {
        circle.y = circles[circ].y;
      }
    }
  }

  /* Helpers */
  const getMousePos = (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  function mouseCollision(x: number, y: number) {
    for(var circ = 0; circ < circles.length; circ++) {
      if(circles[circ].containsPoint(x, y)) {
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
  const run = () => {
    const canvas = document.getElementById('DFACanvas') as HTMLCanvasElement | null;
    if (canvas)  {
      setupDfaCanvas(canvas)
    };
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run(); // DOM is already ready
  }
}

attachWhenReady();

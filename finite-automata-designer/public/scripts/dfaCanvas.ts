var nodeRadius = 30;
var highlight = 'blue';
var base = 'black';
var dragging = false;
var shiftPressed = false;
var startClick: {x: number, y: number} | null = null;
var tempArrow: TemporaryArrow | Arrow | SelfArrow | EntryArrow | null = null;
var selectedObj: Circle | EntryArrow | Arrow | SelfArrow | null = null;
var circles: Circle[] = [];
var arrows: (Arrow | SelfArrow | EntryArrow)[] = [];
var snapToPadding = 10; // pixels
var hitTargetPadding = 6; // pixels

function drawText(
  ctx: CanvasRenderingContext2D,
  originalText: string,
  x: number,
  y: number,
  angeOrNull: number | null,
  isSelected: boolean
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
    drawText(ctx, this.text, this.x, this.y, null, selectedObj == this);

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

class EntryArrow {
  pointsToCircle: Circle;
  deltaX: number;
  deltaY: number;
  text: string;

  constructor(pointsToCircle: Circle, startPoint: {x: number, y: number}) {
    this.pointsToCircle = pointsToCircle;
    this.deltaX = 0
    this.deltaY = 0;
    this.text = ''
    if (startPoint) {
      this.setAnchorPoint(startPoint.x, startPoint.y);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
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

  setAnchorPoint(x: number, y: number) {
    this.deltaX = x - this.pointsToCircle.x;
    this.deltaY = y - this.pointsToCircle.y;

    if (Math.abs(this.deltaX) < snapToPadding) this.deltaX = 0;
    if (Math.abs(this.deltaY) < snapToPadding) this.deltaY = 0;
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

  containsPoint(x: number, y: number) {
    var lineInfo = this.getEndPoints();
    var dx = lineInfo.endX - lineInfo.startX;
		var dy = lineInfo.endY - lineInfo.startY;
		var length = Math.sqrt(dx * dx + dy * dy);
		var percent = (dx * (x - lineInfo.startX) + dy * (y - lineInfo.startY)) / (length * length);
		var distance = (dx * (y - lineInfo.startY) - dy * (x - lineInfo.startX)) / length;
		return (percent > 0 && percent < 1 && Math.abs(distance) < hitTargetPadding); 
  }

}

class StartArrow {

  draw(ctx: CanvasRenderingContext2D) {
    
  }

  setAnchorPoint(x: number, y: number): void {

  }

  containsPoint(x: number, y: number) {

  }

}

class SelfArrow {
  circle: Circle;
  anchorAngle: number;
  mouseOffsetAngle: number;
  text: string;

  constructor(pointsToCircle: Circle, point: {x: number, y: number}) {
    this.circle = pointsToCircle;
    this.anchorAngle = 0;
    this.mouseOffsetAngle = 0;
    this.text = '';

    if (point) {
      this.setAnchorPoint(point.x, point.y);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    var arcInfo = this.getEndPointsAndCircle();
    // draw arc
    ctx.beginPath();
    ctx.arc(arcInfo.circleX, arcInfo.circleY, arcInfo.circleRadius, arcInfo.startAngle, arcInfo.endAngle, false);
    ctx.stroke();
    // Draw the text on the loop farthest from the circle
    var textX = arcInfo.circleX + arcInfo.circleRadius * Math.cos(this.anchorAngle);
		var textY = arcInfo.circleY + arcInfo.circleRadius * Math.sin(this.anchorAngle);
		drawText(ctx, this.text, textX, textY, this.anchorAngle, selectedObj == this);
		// draw the head of the arrow
		drawArrow(ctx, arcInfo.endX, arcInfo.endY, arcInfo.endAngle + Math.PI * 0.4);

  }

  setMouseStart(x: number, y: number): void {
    this.anchorAngle = Math.atan2(y - this.circle.y, x - this.circle.x) + this.mouseOffsetAngle;
    // Snap to 90 degrees
		var snap = Math.round(this.anchorAngle / (Math.PI / 2)) * (Math.PI / 2);
		if (Math.abs(this.anchorAngle - snap) < 0.1) this.anchorAngle = snap;
		// Keep in the range -pi to pi so our containsPoint() function always works
		if (this.anchorAngle < -Math.PI) this.anchorAngle += 2 * Math.PI;
		if (this.anchorAngle > Math.PI) this.anchorAngle -= 2 * Math.PI;
  }

	setAnchorPoint(x: number, y: number) {
		this.anchorAngle = Math.atan2(y - this.circle.y, x - this.circle.x) + this.mouseOffsetAngle;
		// snap to 90 degrees
		var snap = Math.round(this.anchorAngle / (Math.PI / 2)) * (Math.PI / 2);
		if (Math.abs(this.anchorAngle - snap) < 0.1) this.anchorAngle = snap;
		// keep in the range -pi to pi so our containsPoint() function always works
		if (this.anchorAngle < -Math.PI) this.anchorAngle += 2 * Math.PI;
		if (this.anchorAngle > Math.PI) this.anchorAngle -= 2 * Math.PI;
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

  containsPoint(x: number, y:number) {
		var stuff = this.getEndPointsAndCircle();
		var dx = x - stuff.circleX;
		var dy = y - stuff.circleY;
		var distance = Math.sqrt(dx * dx + dy * dy) - stuff.circleRadius;
		return (Math.abs(distance) < hitTargetPadding);
	}
}

class Arrow {

  draw(ctx: CanvasRenderingContext2D) {

  }

  setAnchorPoint(x: number, y: number): void {

  }

  containsPoint(x: number, y: number) {

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

    if (selectedObj != null) {
      if (shiftPressed && selectedObj instanceof Circle) {
        // Draw a SelfArrow to the selected circle
        tempArrow = new SelfArrow(selectedObj, mouse);
      } else {
        dragging = true;
        if (selectedObj instanceof Circle || selectedObj instanceof SelfArrow) {
          selectedObj.setMouseStart(mouse.x, mouse.y);
        }
      }
    } else if (shiftPressed) {
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
      
    } else if (selectedObj instanceof Circle) {
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
        if (targetCircle != null) {
          tempArrow = new StartArrow(); // fix later once startarrow implemented
        } else {
          tempArrow = new TemporaryArrow(startClick, mouse);
        }
      } else {
        if (targetCircle == selectedObj && selectedObj instanceof Circle) {
          tempArrow = new SelfArrow(selectedObj, mouse);
        } else if (targetCircle != null) {
          tempArrow = new Arrow(); // fix later once arrow implemented
        } else if (selectedObj instanceof Circle) {
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

  canvas.addEventListener('mouseup', (event) =>{
    dragging = false;

    if (tempArrow != null) {
      if(!(tempArrow instanceof TemporaryArrow)) {
        selectedObj = tempArrow;
        arrows.push(tempArrow);
      }
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

    for(var arrow = 0; arrow < arrows.length; arrow++) {
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

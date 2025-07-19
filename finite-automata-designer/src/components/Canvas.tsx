'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

// Circle (aka state node)

// Circle (aka state node)
type Circle = {
  x: number;
  y: number;
  radius: number;
  color: string;
  isAccept?: boolean;
  text: string;
  mouseOffsetX: number;
  mouseOffsetY: number;
  setMouseStart: (x: number, y: number) => void;
  setAnchorPoint: (x: number, y: number) => void;
  closestPointOnCircle: (x: number, y: number) => { x: number; y: number };
  containsPoint: (x: number, y: number) => boolean;
  draw: (ctx: CanvasRenderingContext2D) => void;
};

// Factory function to create a Circle
const createCircle = (
  x: number,
  y: number,
  radius: number,
  color: string,
  isAccept: boolean = false,
  text: string = ''
): Circle => ({
  x,
  y,
  radius,
  color,
  isAccept,
  text,
  mouseOffsetX: 0,
  mouseOffsetY: 0,
  setMouseStart: function (x: number, y: number) {
    this.mouseOffsetX = this.x - x;
    this.mouseOffsetY = this.y - y;
  },
  setAnchorPoint: function (x: number, y: number) {
    this.x = x + this.mouseOffsetX;
    this.y = y + this.mouseOffsetY;
  },
  
  closestPointOnCircle: function (x: number, y: number) {
    const dx = x - this.x;
    const dy = y - this.y;
    const scale = Math.sqrt(dx * dx + dy * dy);
    return {
      x: this.x + (dx * this.radius) / scale,
      y: this.y + (dy * this.radius) / scale,
    };
  },
  containsPoint: function (x: number, y: number) {
    return (x - this.x) * (x - this.x) + (y - this.y) * (y - this.y) < this.radius * this.radius;
  },
  draw: function (ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.lineWidth = 1;
    // Draw circle
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.stroke();
    // Draw double circle for accept state
    if (this.isAccept) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius - 5, 0, 2 * Math.PI);
      ctx.stroke();
    }
    // Draw text
    if (this.text) {
      ctx.font = '20px "Times New Roman", serif';
      const width = ctx.measureText(this.text).width;
      ctx.fillText(this.text, this.x - width / 2, this.y + 6);
    }
  },
});


type EntryArrow = {
  type: 'EntryArrow';
  node: Circle;
  deltaX: number;
  deltaY: number;
  color: string,
};

type Arrow = {
  type: 'Arrow';
  nodeA: Circle;
  nodeB: Circle;
  perpendicularPart: number;
  lineAngleAdjust: number;
  color: string;
};

type SelfArrow = {
  type: 'SelfArrow';
  node: Circle;
  anchorAngle: number;
  color: string;
};

type TemporaryLink = {
  type: 'TemporaryLink';
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
};


const FiniteAutomataCanvas = forwardRef((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null) // Canvas ref
  const [circles, setCircles] = useState<Circle[]>([]) // Circle storage + access
  const [selfArrows, setSelfArrows] = useState<SelfArrow[]>([]) // Arrows that start and end at the same node
  const [entryArrows, setEntryArrows] = useState<EntryArrow[]>([]) // Arrows that signal the entry point into the machine
  const [arrows, setArrows] = useState<Arrow[]>([]) // Arrows that go from one node to another
  
  const [isShiftPressed, setIsShiftPressed] = useState(false); // tracking shift key
  const dragStateRef = useRef<{
    selectedCircleIdx: number | null;
    dragging: boolean;
    dragOffset: { x: number; y: number };
  }>({
    selectedCircleIdx: null,
    dragging: false,
    dragOffset: { x: 0, y: 0 },
  });

  // Default values for canvas and circle
  const canvasWidth = 800
  const canvasHeight = 600
  const circleRadius = 30
  const defaultCircleColor: string = "black"
  const circleHighlightColor: string = "blue"

  useEffect(() => {
    draw()
  }, [circles]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        setIsShiftPressed(true);
        // console.log("shift down");
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        setIsShiftPressed(false);
        // console.log("shift up");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [])

  // Function to clear the canvas
  const clear = () => {
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      setCircles([]) // Clear state
    }
  }

  // Expose clear function via ref
  useImperativeHandle(ref, () => ({
    clear,
  }));

  // Draw the canvas
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Maintain pixel smoothness
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    ctx.save();
    ctx.translate(0.5, 0.5);

    circles.forEach((circle) => circle.draw(ctx));

    ctx.restore()
  };


  // Checks if the user clicks inside of a circle
  const collision = (mouseX: number, mouseY: number) => {
    // Collision check
    for (let i = 0; i < circles.length; i++) {
      const distance = Math.sqrt(
        Math.pow((mouseX - circles[i].x), 2) + Math.pow((mouseY - circles[i].y), 2)
      ); // Distance calculation
      if (distance < circles[i].radius) {
        return i;
      }
    };
    return null;
  };
  
  const updateDragOffset = (
    event: React.MouseEvent<HTMLCanvasElement>,
    circleIdx: number 
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const circle = circles[circleIdx];
    dragStateRef.current.dragOffset = {
      x: mouseX - circle.x,
      y: mouseY - circle.y
    };
  };




  // CALLED AFTER MOUSE DOWN AND THEN UP
  // const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
  // }

  // Draw circles on doubleclick
  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const circleIdx = collision(mouseX, mouseY);

    if (circleIdx === null) {
      setCircles((prev) => [
        ...prev,
        createCircle(mouseX, mouseY, circleRadius, circleHighlightColor, false, ''),
      ]);
      dragStateRef.current.selectedCircleIdx = circles.length;
    } else {
      setCircles((prev) =>
        prev.map((circle, i) =>
          i === circleIdx ? { ...circle, isAccept: !circle.isAccept } : circle
        )
      );
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const circleIdx = collision(mouseX, mouseY);
    
    if (circleIdx !== null) {
      dragStateRef.current.selectedCircleIdx = circleIdx;
      dragStateRef.current.dragging = true;
      updateDragOffset(event, circleIdx);

      setCircles((prev) =>
        prev.map((circle, i) =>
          i == circleIdx ? { ...circle, color: circleHighlightColor } : { ...circle, color: defaultCircleColor}
        )
      );
    } else {
      dragStateRef.current.selectedCircleIdx = null;
      setCircles((prev) => 
        prev.map((circle) => ({ ... circle, color: defaultCircleColor}))
      );
    }
    // console.log("dragging");
  };

  const handleMouseUp = () => {
    dragStateRef.current.dragging = false
    // console.log("not dragging")
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top
    
    const circleIdx = dragStateRef.current.selectedCircleIdx;
    if (dragStateRef.current.dragging) {
      setCircles((prev) =>
        prev.map((circle, i) =>
          i === circleIdx 
            ? {
                ...circle,
                x: mouseX - dragStateRef.current.dragOffset.x,
                y: mouseY - dragStateRef.current.dragOffset.y,
            } :
            circle
        )
      )
    }
  };

  return (
    <div className="flex justify-center mt-4">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        // onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="border border-gray-400"
      />
    </div>
  )
});

export default FiniteAutomataCanvas

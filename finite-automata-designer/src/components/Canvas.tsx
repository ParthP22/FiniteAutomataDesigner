'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

// Define the structure of a circle (aka state node)
type Circle = {
  x: number;
  y: number;
  radius: number;
  color: string;
  isAccept?: boolean
};

const FiniteAutomataCanvas = forwardRef((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null) // Canvas ref
  const [circles, setCircles] = useState<Circle[]>([]) // Storage of and setting circles

  // Default values for canvas and circle
  const canvasWidth = 800
  const canvasHeight = 600
  const circleRadius = 30

  // Circle references
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const defaultCircleColor: string = "black"
  const circleHighlightColor: string = "blue"
  let selectedCircleIdx: number | null = null
  let dragging: boolean = false;
  let insideCircle: boolean = false;


  // Function to clear the canvas
  const clear = () => {
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      setCircles([]) // Clear state so it doesn’t redraw old circles
    }
  }

  // Expose clear function via ref
  useImperativeHandle(ref, () => ({
    clear,
  }))

  // Called inside useEffect and can be called by other methods to redraw the canvas
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

    circles.forEach(({ x, y, radius, color, isAccept }) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
      // If an accept state
      if (isAccept) {
        ctx.beginPath();
        ctx.arc(x, y, radius - 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  };

  // Makes all of the circles black again
  const clearSelection = () => {
    circles.forEach(circle => {
      circle.color = defaultCircleColor;
    });
  }

  // Checks if the user clicks inside of a circle
  const collision = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return false;
    
    // get x y coords of click
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Collision check
    insideCircle = false;
    for (let i = 0; i < circles.length; i++) {
      const distance = Math.sqrt(Math.pow((x - circles[i].x), 2) + Math.pow((y - circles[i].y), 2)); // Distance calculation
      if (distance < circles[i].radius) {
        insideCircle = true;
        selectedCircleIdx = i
        // console.log("Index found in collision check",selectedCircleIdx)
        break;
      }
    };
    return insideCircle;
  }

  const highlight_circle = () => {
    if (insideCircle && selectedCircleIdx != null) {
      clearSelection()
      circles[selectedCircleIdx].color = circleHighlightColor
      draw()
    } else {
      clearSelection();
      draw();
      selectedCircleIdx = null;
    }
  }

  const updateDragOffset = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return

    if (insideCircle && selectedCircleIdx != null) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const circle = circles[selectedCircleIdx];
      dragOffsetRef.current = {
        x: mouseX - circle.x,
        y: mouseY - circle.y
      };
    }
  }

  useEffect(() => {
    draw()
  }, [circles])


  // CALLED AFTER MOUSE DOWN AND THEN UP
  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
  }

  // Draw circles on doubleclick
  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return

    // get x y coords of click
    const rect = canvas.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    insideCircle = collision(event);

    // Make the circle add it to list, make it highlighted (i.e. selected)
    if (!insideCircle) {
      clearSelection();
      const newCircle: Circle = { x: mouseX, y: mouseY, radius: circleRadius, color: circleHighlightColor, isAccept: false};
      setCircles(prev => [...prev, newCircle])
      selectedCircleIdx = circles.length - 1;
    } else {

      if (selectedCircleIdx != null){
        circles[selectedCircleIdx].isAccept = !circles[selectedCircleIdx].isAccept;
        draw()
      }
      
    }
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return
    
    insideCircle = collision(event);
    highlight_circle()

    updateDragOffset(event)

    dragging = true
    // console.log("dragging");
  }

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return

    dragging = false
    // console.log("not dragging")
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    insideCircle = collision(event);
    if (dragging && insideCircle) {
      const rect = canvas.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top
      
      if (selectedCircleIdx != null) {
        const circle = circles[selectedCircleIdx];
        // const some_x = x - (x - circle.x);
        // const some_y = y - (y - circle.y);
        // console.log("Drag offset X: ", (x - circle.x), "mouse x: ",x, "substraction: ", x - (x - circle.x));
        // console.log("Drag offset Y: ", (y - circle.y), "mouse y: ",y, "substraction: ", y - (y - circle.y));
        circle.x = mouseX - dragOffsetRef.current.x;
        circle.y = mouseY - dragOffsetRef.current.y;

          draw();
      }
    }
  }

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
})

// Optional display name for debugging
FiniteAutomataCanvas.displayName = 'FiniteAutomataCanvas'

export default FiniteAutomataCanvas

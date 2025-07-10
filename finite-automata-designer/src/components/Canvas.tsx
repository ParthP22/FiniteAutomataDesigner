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
  const defaultCircleColor = "black"
  const circleHighlightColor = "blue"
  let selectedCircleIdx: number | null = null


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

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    circles.forEach(({ x, y, radius, color, isAccept }) => {
      ctx.strokeStyle = color;
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
    let insideCircle = false;
    for (let i = 0; i < circles.length; i++) {
      const distance = Math.sqrt(Math.pow((x - circles[i].x), 2) + Math.pow((y - circles[i].y), 2)); // Distance calculation
      if (distance < circles[i].radius) {
        insideCircle = true;
        selectedCircleIdx = i
        break;
      }
    };
    return insideCircle;
  }


  useEffect(() => {
    draw()
  }, [circles])

  // Handle user clicks to select circles
  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const insideCircle = collision(event);

    // When inside a circle make it blue else make all circles black again
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

  // Draw circles on doubleclick
  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return

    // get x y coords of click
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const insideCircle = collision(event);


    if (!insideCircle) {
      clearSelection();
      const newCircle: Circle = { x, y, radius: circleRadius, color: circleHighlightColor, isAccept: false};
      setCircles(prev => [...prev, newCircle]);

      selectedCircleIdx = circles.length;
      // console.log(editingCircleID)
    } else {

      if (selectedCircleIdx != null ){
        circles[selectedCircleIdx].isAccept = !circles[selectedCircleIdx].isAccept;
      }
      
    }
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    console.log("dragging");
    const canvas = canvasRef.current;
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    if (selectedCircleIdx) {
      circles[selectedCircleIdx].x = x;
      circles[selectedCircleIdx].y = y;
      draw();
    }
    console.log("dragging");
  }

  return (
    <div className="flex justify-center mt-4">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        className="border border-gray-400"
      />
    </div>
  )
})

// Optional display name for debugging
FiniteAutomataCanvas.displayName = 'FiniteAutomataCanvas'

export default FiniteAutomataCanvas

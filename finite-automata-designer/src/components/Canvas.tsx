'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

// Circle (aka state node)
type Circle = {
  x: number;
  y: number;
  radius: number;
  color: string;
  isAccept?: boolean
};

// Line
type EntryArrow = {
  type: 'EntryArrow';
  node: Circle;
  deltaX: number;
  deltaY: number;
  color: string,
}

type Arrow = {
  type: 'Arrow';
  nodeA: Circle;
  nodeB: Circle;
  perpendicularPart: number;
  lineAngleAdjust: number;
  color: string;
}

type SelfArrow = {
  type: 'SelfArrow';
  node: Circle;
  anchorAngle: number;
  color: string;
}

type TemporaryLink = {
  type: 'TemporaryLink';
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
}

type FSMObject = Circle | EntryArrow | Arrow | SelfArrow | TemporaryLink;



const FiniteAutomataCanvas = forwardRef((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null) // Canvas ref
  const [circles, setCircles] = useState<Circle[]>([]) // Circle storage + access
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
  }))

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

    circles.forEach(({ x, y, radius, color, isAccept }) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();

      if (isAccept) {
        ctx.beginPath();
        ctx.arc(x, y, radius - 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    ctx.restore()
  };

  // Makes all of the circles black again
  const clearSelection = () => {
    setCircles((prev) =>
      prev.map((circle) => ({ ...circle, color: defaultCircleColor}))
    );
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
  }
  
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
  }

  useEffect(() => {
    draw()
  }, [circles])


  // CALLED AFTER MOUSE DOWN AND THEN UP
  // const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
  // }

  // Draw circles on doubleclick
  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    const circleIdx = collision(mouseX, mouseY);

    // Make the circle add it to list, make it highlighted (i.e. selected)
    if (circleIdx === null) {
      setCircles((prev) => [
        ...prev,
        {
          x: mouseX,
          y: mouseY,
          radius: circleRadius,
          color: circleHighlightColor,
          isAccept: false,
        }
      ]);
      dragStateRef.current.selectedCircleIdx = circles.length;
    } else {
      // Toggle accept state
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
  }

  const handleMouseUp = () => {
    dragStateRef.current.dragging = false
    // console.log("not dragging")
  }

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

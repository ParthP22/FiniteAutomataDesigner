'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Circle, createCircle } from './Circle';
import { EntryArrow, createEntryArrow } from './EntryArrow';
import { Arrow, createArrow } from './Arrow';
import { SelfArrow, createSelfArrow } from './SelfArrow';

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
    selectedObj: Circle | EntryArrow | Arrow | SelfArrow | null;
    dragging: boolean;
  }>({
    selectedObj: null,
    dragging: false,
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

  // Expose clear function via ref
  useImperativeHandle(ref, () => ({
    clear,
  }));

  const updateDragOffset = (
    event: React.MouseEvent<HTMLCanvasElement>,
    collidedObj: Circle | EntryArrow
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if ('setMouseStart' in collidedObj) {
      collidedObj.setMouseStart(mouseX, mouseY);
    }
  };

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

  const collisionObj = (mouseX: number, mouseY: number) => {
    // Circle collision check
    for (let i = 0; i < circles.length; i++) {
      if (circles[i].containsPoint(mouseX, mouseY)) {
        return circles[i]
      }
    };

    return null;
  }


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

    const collidedObj = collisionObj(mouseX, mouseY);

    if (collidedObj == null) {
      const newCircle = createCircle('', mouseX, mouseY, circleRadius, circleHighlightColor, false, '');
      setCircles((prev) => { 
        const updateCircles = [ ...prev, newCircle ]
        dragStateRef.current.selectedObj = updateCircles[updateCircles.length - 1];
        return updateCircles;
      });
    } else if (collidedObj.type == "Circle") {
      setCircles((prev) =>
        prev.map((circle, i) =>
          collidedObj == circle ? { ...circle, isAccept: !circle.isAccept } : circle
        )
      );
      dragStateRef.current.selectedObj = collidedObj;
    }
  };

  // Handle selection and highlighting
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const collidedObj = collisionObj(mouseX, mouseY);
    if (collidedObj !== null && collidedObj.type === 'Circle') {
      const updatedCircle = { ...collidedObj, color: circleHighlightColor };
      updateDragOffset(event, updatedCircle);
      setCircles((prev) =>
        prev.map((circle) =>
          circle === collidedObj ? updatedCircle : { ...circle, color: defaultCircleColor } // Highlights the specific circle
        )
      );
      // Update references to the circle that was just highlighted
      dragStateRef.current.selectedObj = updatedCircle;
    } else {
      setCircles((prev) =>
        prev.map((circle) => ({ ...circle, color: defaultCircleColor }))
      );
      dragStateRef.current.selectedObj = null;
    }
    dragStateRef.current.dragging = true;
  };

  const handleMouseUp = () => {
    dragStateRef.current.dragging = false;
    dragStateRef.current.selectedObj = null;
    // console.log("not dragging")
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const collidedObj = dragStateRef.current.selectedObj;
    if (collidedObj !== null && dragStateRef.current.dragging && collidedObj.type === 'Circle') {
      setCircles((prev) =>
        prev.map((circle) => {
          if (circle === collidedObj) {
            const updatedCircle = {
              ...circle,
              x: mouseX + circle.mouseOffsetX,
              y: mouseY + circle.mouseOffsetY,
            };
            dragStateRef.current.selectedObj = updatedCircle;
            return updatedCircle;
          }
          return circle;
        })
      );
    }
  };

  // Function to clear the canvas
  const clear = () => {
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      setCircles([]) // Clear state
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
});

export default FiniteAutomataCanvas

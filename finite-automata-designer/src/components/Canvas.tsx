'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Circle, createCircle } from './Circle';
import { EntryArrow, createEntryArrow } from './EntryArrow';
import { Arrow, createArrow } from './Arrow';
import { SelfArrow, createSelfArrow } from './SelfArrow';
import { TemporaryLink, createTemporaryLink } from './TemporaryLink';

const FiniteAutomataCanvas = forwardRef((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [arrows, setArrows] = useState<(EntryArrow)[]>([]);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const selectedObj = useRef<Circle | TemporaryLink | Arrow | SelfArrow | EntryArrow>(null);
  const dragging = useRef<boolean>(false);
  const originalClick = useRef<{
    x: number,
    y: number
  }>(null);

  const canvasWidth = 800;
  const canvasHeight = 600;
  const circleRadius = 30;
  const defaultColor: string = "black";
  const highlight: string = "blue";

  useEffect(() => {
    draw();
  }, [circles, arrows]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        setIsShiftPressed(true);
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    clear,
  }));

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    ctx.save();
    ctx.translate(0.5, 0.5);


    circles.forEach((circle) => circle.draw(ctx));

    arrows.forEach((arrow) => arrow.draw(ctx));

    ctx.restore();
  };

  const relativeMousePos = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return {
      x: 0,
      y: 0
    }

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  }

  const collisionObj = (mouseX: number, mouseY: number): Circle | EntryArrow | null => {
    for (const circle of circles) {
      if (circle.containsPoint(mouseX, mouseY)) {
        return circle;
      }
    }
    for (const arrow of arrows) {
      if (arrow.containsPoint(mouseX, mouseY)) {
        return arrow;
      }
    }
    return null;
  };

  // On left mouse btn down select obj set all other objs to default color, set draggin to true if clicked on not null
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const mouse = relativeMousePos(event);
    originalClick.current = mouse;
    dragging.current = false;
    selectedObj.current = collisionObj(mouse.x, mouse.y);

    if (selectedObj.current instanceof Circle) {
      const updatedCircle = selectedObj.current.cloneWith({ color: highlight });
      dragging.current = true;
      setCircles((prevCircles) =>
        prevCircles.map((circle) => 
          circle === selectedObj.current ? updatedCircle : circle.cloneWith({ color: defaultColor })
        )
      );
    } else {
      setCircles((prevCircles) =>
        prevCircles.map((circle) => 
          circle.cloneWith({ color: defaultColor })
        )
      )
    }
  };

  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const mouse = relativeMousePos(event);
    selectedObj.current = collisionObj(mouse.x, mouse.y);

    if (selectedObj.current == null) {
      const newCircle = createCircle(mouse.x, mouse.y, circleRadius, highlight, false, '');
      selectedObj.current = newCircle;
      setCircles((prev) => {
        const updateCircles = [...prev, newCircle];
        return updateCircles;
      });
    } else if (selectedObj.current instanceof Circle) {
      setCircles((prev) =>
        prev.map((circle) =>
          circle === selectedObj.current ? circle.cloneWith({ isAccept: !circle.isAccept, color: highlight }) : circle
        )
      );
    }
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mouse = relativeMousePos(event);
    dragging.current = false;
    
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mouse = relativeMousePos(event);
    const collidedObj =  collisionObj(mouse.x, mouse.y);

    if (dragging.current && selectedObj.current) {
      console.log("Dragging: ", selectedObj.current);
      if (selectedObj.current instanceof Circle) {
        setCircles((prevCircles) => 
          prevCircles.map((circle) => {
            if (circle === collidedObj) {
              console.log("inside the deeper if iff")
              const updatedCircle = circle.cloneWith({
                x: mouse.x + circle.mouseOffsetX,
                y: mouse.y + circle.mouseOffsetY,
              });
              selectedObj.current = updatedCircle;
              // console.log(mouse);
              return updatedCircle;
            }
            return circle;
          })
        );
      }
    }
    draw();
  };

  const clear = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      setCircles([]);
      setArrows([]);
    }
  };

  return (
    <div className="flex justify-center mt-4">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="border border-gray-400"
      />
    </div>
  );
});

export default FiniteAutomataCanvas;
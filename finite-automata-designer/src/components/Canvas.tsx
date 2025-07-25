'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Circle, createCircle } from './Circle';
import { EntryArrow, createEntryArrow } from './EntryArrow';
import { Arrow, createArrow } from './Arrow';
import { SelfArrow, createSelfArrow } from './SelfArrow';
import { TemporaryLink, createTemporaryLink } from './TemporaryLink';
import { secureHeapUsed } from 'crypto';

const FiniteAutomataCanvas = forwardRef((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [arrows, setArrows] = useState<(EntryArrow)[]>([]);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const selectedObj = useRef<Circle | Arrow | SelfArrow | EntryArrow>(null);
  const dragging = useRef<boolean>(false);
  const originalClick = useRef<{
    x: number,
    y: number
  }>(null);
  const tempArrow = useRef<TemporaryLink>(null);

  const canvasWidth = 800;
  const canvasHeight = 600;
  const circleRadius = 30;
  const defaultColor: string = "black";
  const highlight: string = "blue";

  useEffect(() => {
    draw();
  }, [circles, arrows]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key
      if (event.key === 'Shift') {
        setIsShiftPressed(true);
      }
      if (selectedObj.current !== null && selectedObj.current instanceof Circle) {
        const currentCircle = selectedObj.current;
        if (key === 'Backspace') {
          event.preventDefault(); // prevent browser from navigating back (apparently...)
          currentCircle.text = currentCircle.text.slice(0, -1);
        } else if (key.length === 1) {
          currentCircle.text += key;
        }
        setCircles((prevCircles) =>
          prevCircles.map((circle) =>
            circle === selectedObj.current ? currentCircle : circle
          )
        );
        selectedObj.current = currentCircle;
      }
      
    };
    
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {

      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
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

    if (tempArrow.current) {
      tempArrow.current.draw(ctx);
    }

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

  // Select obj set all other objs to default color, set draggin to true if clicked on not null
  const onMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const mouse = relativeMousePos(event);
    originalClick.current = mouse;
    dragging.current = false;
    const collidedObj = collisionObj(mouse.x, mouse.y);
    if (collidedObj !== null) {
      if (isShiftPressed && collidedObj instanceof Circle) {
        // add self arrow drawing logic
      } else {
        dragging.current = true;
        if (collidedObj instanceof Circle) {
          const updatedCircle = collidedObj.cloneWith({ color: highlight });
          dragging.current = true;
          setCircles((prevCircles) =>
            prevCircles.map((circle) => {
              if (circle === collidedObj) {
                updatedCircle.setMouseStart(mouse.x, mouse.y);
                selectedObj.current = updatedCircle;
                return updatedCircle;
              }
              return circle.cloneWith({ color: defaultColor })
            })            
          );
        } else {
          setCircles((prevCircles) =>
            prevCircles.map((circle) => 
              circle.cloneWith({ color: defaultColor })
            )
          )
          selectedObj.current = null;
        }
      }
    } else {
      setCircles((prevCircles) =>
        prevCircles.map((circle) => 
          circle.cloneWith({ color: defaultColor })
        )
      )
      selectedObj.current = null;
      originalClick.current = {
        x: mouse.x,
        y: mouse.y
      }
      // Temporary arrow logic purely cosmetic for user feedback
      if (isShiftPressed) {
        dragging.current = true;
        tempArrow.current = createTemporaryLink(
          originalClick.current,
          originalClick.current,
          defaultColor
        )
      }
    }
  };


  const onDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const mouse = relativeMousePos(event);
    const clickedObj = collisionObj(mouse.x, mouse.y);

    if (clickedObj == null) {
      // Make the new circle
      const newCircle = createCircle(mouse.x, mouse.y, circleRadius, highlight, false, '');

      setCircles((prev) => {
        // Set all prev circles to black (default color)
        const resetCircles = prev.map((circle) =>
          circle.cloneWith({ color: defaultColor })
        );
        // Add the new circle to the list
        const updateCircles = [...resetCircles, newCircle];
        return updateCircles;
      });
      selectedObj.current = newCircle;
    } else if (clickedObj instanceof Circle) {
      const updatedCircle = clickedObj.cloneWith({ isAccept: !clickedObj.isAccept })
      setCircles((prev) =>
        prev.map((circle) => {
          if (circle === clickedObj) {
            return updatedCircle;
          }
          return circle;
        })
      );
      selectedObj.current = updatedCircle;
    }
  };

  const onMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mouse = relativeMousePos(event);
    dragging.current = false;
    tempArrow.current = null;
    draw();
  };

  const onMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mouse = relativeMousePos(event);
    const collidedObj = selectedObj.current;
    if (dragging.current && isShiftPressed && tempArrow.current && originalClick.current) {
      tempArrow.current = tempArrow.current?.cloneWith({
        from: { x: originalClick.current.x, y: originalClick.current.y },
        to: { x: mouse.x, y: mouse.y}
      })
      draw(); // Need to manually call for a change on a ref and not state
    }
    else if (dragging.current && selectedObj.current) {
      if (selectedObj.current instanceof Circle) {
        setCircles((prevCircles) => 
          prevCircles.map((circle) => {
            if (circle === collidedObj) {
              collidedObj.setAnchorPoint(mouse.x, mouse.y);
              selectedObj.current = collidedObj;
              return collidedObj;
            } 
            return circle;
          })
        );
      }
    }
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
        onDoubleClick={onDoubleClick}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        className="border border-gray-400"
      />
    </div>
  );
});

export default FiniteAutomataCanvas;
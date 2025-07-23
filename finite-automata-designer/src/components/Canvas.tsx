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
  const [selfArrows, setSelfArrows] = useState<SelfArrow[]>([]);
  const [entryArrows, setEntryArrows] = useState<(EntryArrow | TemporaryLink)[]>([]);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const dragStateRef = useRef<{
    selectedObj: Circle | EntryArrow | Arrow | SelfArrow | TemporaryLink | null;
    dragging: boolean;
    tempLinkStart: { x: number; y: number } | null;
  }>({
    selectedObj: null,
    dragging: false,
    tempLinkStart: null,
  });

  const canvasWidth = 800;
  const canvasHeight = 600;
  const circleRadius = 30;
  const defaultCircleColor: string = "black";
  const circleHighlightColor: string = "blue";

  useEffect(() => {
    draw();
  }, [circles, entryArrows]);

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

  const updateDragOffset = (
    event: React.MouseEvent<HTMLCanvasElement>,
    collidedObj: Circle | EntryArrow
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    collidedObj.setMouseStart(mouseX, mouseY);
  };

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

    entryArrows.forEach((arrow) => {
      arrow.draw(ctx);
    });
    circles.forEach((circle) => circle.draw(ctx));

    ctx.restore();
  };

  const collisionObj = (mouseX: number, mouseY: number): Circle | EntryArrow | null => {
    for (const circle of circles) {
      if (circle.containsPoint(mouseX, mouseY)) {
        return circle;
      }
    }
    for (const arrow of entryArrows) {
      if (arrow instanceof EntryArrow && arrow.containsPoint(mouseX, mouseY)) {
        return arrow;
      }
    }
    return null;
  };

  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const collidedObj = collisionObj(mouseX, mouseY);

    if (collidedObj == null) {
      const newCircle = createCircle(mouseX, mouseY, circleRadius, circleHighlightColor, false, '');
      setCircles((prev) => {
        const updateCircles = [...prev, newCircle];
        dragStateRef.current.selectedObj = updateCircles[updateCircles.length - 1];
        return updateCircles;
      });
    } else if (collidedObj instanceof Circle) {
      setCircles((prev) =>
        prev.map((circle) =>
          circle === collidedObj ? circle.cloneWith({ isAccept: !circle.isAccept }) : circle
        )
      );
      dragStateRef.current.selectedObj = collidedObj;
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const collidedObj = collisionObj(mouseX, mouseY);
    if (collidedObj instanceof Circle) {
      const updatedCircle = collidedObj.cloneWith({ color: circleHighlightColor });
      updateDragOffset(event, updatedCircle);
      setCircles((prev) =>
        prev.map((circle) =>
          circle === collidedObj ? updatedCircle : circle.cloneWith({ color: defaultCircleColor })
        )
      );
      setEntryArrows((prev) =>
        prev.map((arrow) => arrow.cloneWith({ color: defaultCircleColor }))
      );
      dragStateRef.current.selectedObj = updatedCircle;
      dragStateRef.current.tempLinkStart = null;
      dragStateRef.current.dragging = true;
    } else if (collidedObj instanceof EntryArrow) {
      const updatedArrow = collidedObj.cloneWith({ color: circleHighlightColor });
      updateDragOffset(event, updatedArrow);
      setEntryArrows((prev) =>
        prev.map((arrow) =>
          arrow === collidedObj ? updatedArrow : arrow.cloneWith({ color: defaultCircleColor })
        )
      );
      setCircles((prev) =>
        prev.map((circle) => circle.cloneWith({ color: defaultCircleColor }))
      );
      dragStateRef.current.selectedObj = updatedArrow;
      dragStateRef.current.tempLinkStart = { x: updatedArrow.node.x + updatedArrow.deltaX, y: updatedArrow.node.y + updatedArrow.deltaY };
      dragStateRef.current.dragging = true;
    } else if (collidedObj === null && isShiftPressed) {
      const tempLink = createTemporaryLink({ x: mouseX, y: mouseY }, { x: mouseX, y: mouseY }, defaultCircleColor);
      setEntryArrows((prev) => [...prev, tempLink]);
      setCircles((prev) =>
        prev.map((circle) => circle.cloneWith({ color: defaultCircleColor }))
      );
      dragStateRef.current.selectedObj = tempLink;
      dragStateRef.current.tempLinkStart = { x: mouseX, y: mouseY };
      dragStateRef.current.dragging = true;
    } else {
      setCircles((prev) =>
        prev.map((circle) => circle.cloneWith({ color: defaultCircleColor }))
      );
      setEntryArrows((prev) =>
        prev.map((arrow) => arrow.cloneWith({ color: defaultCircleColor }))
      );
      dragStateRef.current.selectedObj = null;
      // dragStateRef.current.tempLinkStart = null;
      dragStateRef.current.dragging = false;
    }
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const collidedObj = collisionObj(mouseX, mouseY);
    if (dragStateRef.current.tempLinkStart && collidedObj instanceof Circle) {
      console.log(collidedObj)
      console.log(dragStateRef.current.tempLinkStart)
      setEntryArrows((prev) => [
        ...prev.filter((arrow) => !(arrow instanceof TemporaryLink)),
        createEntryArrow(collidedObj, dragStateRef.current.tempLinkStart!.x - collidedObj.x, dragStateRef.current.tempLinkStart!.y - collidedObj.y, defaultCircleColor),
      ]);
    } else if (dragStateRef.current.tempLinkStart) {
      setEntryArrows((prev) => prev.filter((arrow) => !(arrow instanceof TemporaryLink)));
    }

    dragStateRef.current.dragging = false;
    dragStateRef.current.selectedObj = null;
    // dragStateRef.current.tempLinkStart = null;
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const collidedObj = dragStateRef.current.selectedObj;
    if (collidedObj !== null && dragStateRef.current.dragging) {
      if (collidedObj instanceof Circle) {
        setCircles((prev) =>
          prev.map((circle) => {
            if (circle === collidedObj) {
              const updatedCircle = circle.cloneWith({
                x: mouseX + circle.mouseOffsetX,
                y: mouseY + circle.mouseOffsetY,
              });
              dragStateRef.current.selectedObj = updatedCircle;
              return updatedCircle;
            }
            return circle;
          })
        );
      } else if (collidedObj instanceof EntryArrow) {
        setEntryArrows((prev) =>
          prev.map((arrow) => {
            if (arrow === collidedObj) {
              const updatedArrow = arrow.cloneWith({
                deltaX: mouseX - arrow.node.x,
                deltaY: mouseY - arrow.node.y,
              });
              dragStateRef.current.selectedObj = updatedArrow;
              return updatedArrow;
            }
            return arrow;
          })
        );
      } else if (collidedObj instanceof TemporaryLink) {
        setEntryArrows((prev) =>
          prev.map((arrow) => {
            if (arrow === collidedObj) {
              const updatedLink = arrow.cloneWith({
                to: { x: mouseX, y: mouseY },
              });
              dragStateRef.current.selectedObj = updatedLink;
              return updatedLink;
            }
            return arrow;
          })
        );
      }
      draw();
    }
  };

  const clear = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      setCircles([]);
      setEntryArrows([]);
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
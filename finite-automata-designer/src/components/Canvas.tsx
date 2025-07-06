'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

// Define the structure of a circle (aka state node)
type Circle = {
  x: number;
  y: number;
  radius: number;
};


const FiniteAutomataCanvas = forwardRef((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null) // Canvas ref
  const [circles, setCircles] = useState<Circle[]>([]) // Storage of and setting circles

  // Default values for canvas and circle
  const canvasWidth = 800
  const canvasHeight = 600
  const circleRadius = 20

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

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    circles.forEach(({ x, y, radius }) => {
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.stroke()
    })
  }, [circles])

  // Handle user clicks to draw circles
  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return;
    console.log("click")
    // get x y coords of click
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    let insideCircle = false;
    for (const circle of circles) {
      const distance = Math.sqrt(Math.pow((x - circle.x), 2) + Math.pow((y - circle.y), 2)); // Distance calculation
      if (distance < circle.radius) {
        insideCircle = true;
        break;
      }
    };

    if (!insideCircle) {
      const newCircle: Circle = { x, y, radius: circleRadius }
      setCircles(prev => [...prev, newCircle])
    }


    
  }

  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return
    console.log("double click")
  }

  const handleDrag = (event: React.DragEvent<HTMLCanvasElement>) => {
    return
  }

  return (
    <div className="flex justify-center mt-4">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onDrag={handleDrag}
        className="border border-gray-400"
      />
    </div>
  )
})

// Optional display name for debugging
FiniteAutomataCanvas.displayName = 'FiniteAutomataCanvas'

export default FiniteAutomataCanvas

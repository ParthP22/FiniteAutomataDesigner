'use client';

import { useRef, useEffect, useState } from 'react';

// Define the structure of a circle (aka state node)
type Circle = {
  x: number;
  y: number;
  radius: number;
};

export default function FiniteAutomataCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null); // Get a reference to the canvas DOM element
  const [circles, setCircles] = useState<Circle[]>([]); // Store all drawn circles in state

  // Set canvas dimensions and default circle size
  const canvasWidth = 800;
  const canvasHeight = 600;
  const circleRadius = 30;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d'); // Get drawing context
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas before redrawing

    // Loop through and draw each circle
    circles.forEach(({ x, y, radius }) => {
      ctx.beginPath(); // Start a new drawing path
      ctx.arc(x, y, radius, 0, Math.PI * 2); // Draw a full circle at (x, y) with radius
      ctx.stroke(); // Outline the circle
    });
  }, [circles]); // Re-run when `circles` state changes

  // Handle user clicks on the canvas
  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get the mouse position relative to the canvas
    const rect = canvas.getBoundingClientRect(); // Canvas position on screen
    const x = event.clientX - rect.left; // X inside canvas
    const y = event.clientY - rect.top;  // Y inside canvas

    // Create a new circle at that position
    const newCircle: Circle = { x, y, radius: circleRadius };

    // Add the new circle to the list of circles (triggers a re-render)
    setCircles(prev => [...prev, newCircle]);
  };

  // Render the canvas
  return (
    <div className="flex justify-center mt-4">
      <canvas
        ref={canvasRef} // Attach the canvas DOM node to `canvasRef`
        width={canvasWidth}
        height={canvasHeight}
        onClick={handleClick} // Register click handler
        className="border border-gray-400" // Optional styling
      />
    </div>
  );
}

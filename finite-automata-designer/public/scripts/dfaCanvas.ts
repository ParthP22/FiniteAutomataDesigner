import { Circle } from './Circle';
import { Arrow } from './Arrow';
import { EntryArrow } from './EntryArrow';
import { SelfArrow } from './SelfArrow';
import { TemporaryArrow } from './TemporaryArrow'
function setupDfaCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  /* ---------- example state ----------- */
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };

  /* ---------- helpers ----------- */
  const getMousePos = (ev: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
  };

  /* ---------- event handlers ----------- */
  canvas.addEventListener('dblclick', (ev) => {
    const { x, y } = getMousePos(ev);
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fillStyle = 'skyblue';
    ctx.fill();
    ctx.stroke();
  });

  canvas.addEventListener('mousedown', (ev) => {
    isDragging = true;
    dragStart = getMousePos(ev);
  });

  canvas.addEventListener('mousemove', (ev) => {
    if (!isDragging) return;
    const { x, y } = getMousePos(ev);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(dragStart.x, dragStart.y);
    ctx.lineTo(x, y);
    ctx.stroke();
  });

  canvas.addEventListener('mouseup', () => (isDragging = false));
}

/* -----------------------------------------------------------
 * Attach automatically when DOM is ready.
 * --------------------------------------------------------- */
function attachWhenReady() {
  const run = () => {
    const canvas = document.getElementById('DFACanvas') as HTMLCanvasElement | null;
    if (canvas) setupDfaCanvas(canvas);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run(); // DOM is already ready
  }
}

attachWhenReady();

import { Circle } from './Circle';

export class Arrow {
  type: 'Arrow' = 'Arrow';
  from: Circle;
  to: Circle;
  color: string;

  constructor(from: Circle, to: Circle, color: string) {
    this.from = from;
    this.to = to;
    this.color = color;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Placeholder for drawing logic
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.lineWidth = 1;
  }

  containsPoint(x: number, y: number): boolean {
    return false; // Placeholder for collision detection
  }

  cloneWith(props: Partial<Arrow>): Arrow {
    return new Arrow(
      props.from ?? this.from,
      props.to ?? this.to,
      props.color ?? this.color
    );
  }
}

export function createArrow(from: Circle, to: Circle, color: string): Arrow {
  return new Arrow(from, to, color);
}
import { Circle } from './Circle';

export class SelfArrow {
  node: Circle;
  color: string;
  text: string;

  constructor(node: Circle, color: string) {
    this.node = node;
    this.color = color;
    this.text = "";
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.lineWidth = 1;
  }

  containsPoint(x: number, y: number): boolean {
    return false; // Placeholder for collision detection
  }

  cloneWith(props: Partial<SelfArrow>): SelfArrow {
    return new SelfArrow(
      props.node ?? this.node,
      props.color ?? this.color
    );
  }
    
}

export function createSelfArrow(node: Circle, color: string): SelfArrow {
  return new SelfArrow(node, color);
}
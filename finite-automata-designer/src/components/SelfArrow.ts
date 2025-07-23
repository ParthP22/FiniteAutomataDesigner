import { Circle } from './Circle';

export class SelfArrow {
  type: 'SelfArrow' = 'SelfArrow';
  node: Circle;
  color: string;

  constructor(node: Circle, color: string) {
    this.node = node;
    this.color = color;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Placeholder for drawing logic
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
import { Circle } from './Circle';

export class EntryArrow {
  type: 'EntryArrow' = 'EntryArrow';
  node: Circle;
  deltaX: number;
  deltaY: number;
  color: string;

  constructor(node: Circle, deltaX: number, deltaY: number, color: string) {
    this.node = node;
    this.deltaX = deltaX;
    this.deltaY = deltaY;
    this.color = color;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    const startX = this.node.x + this.deltaX;
    const startY = this.node.y + this.deltaY;
    const end = this.node.closestPointOnCircle(startX, startY);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    const angle = Math.atan2(end.y - startY, end.x - startX);
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - 8 * dx + 5 * dy, end.y - 8 * dy - 5 * dx);
    ctx.lineTo(end.x - 8 * dx - 5 * dy, end.y - 8 * dy + 5 * dx);
    ctx.fill();
  }

  containsPoint(x: number, y: number): boolean {
    const startX = this.node.x + this.deltaX;
    const startY = this.node.y + this.deltaY;
    const end = this.node.closestPointOnCircle(startX, startY);
    const lineDx = end.x - startX;
    const lineDy = end.y - startY;
    const lineLength = Math.sqrt(lineDx * lineDx + lineDy * lineDy);
    const pointDx = x - startX;
    const pointDy = y - startY;
    const dotProduct = lineDx * pointDx + lineDy * pointDy;
    const projectionFraction = dotProduct / (lineLength * lineLength);
    const perpendicularDistance = Math.abs(lineDx * pointDy - lineDy * pointDx) / lineLength;
    const hitTargetPadding = 6;
    return projectionFraction > 0 && projectionFraction < 1 && perpendicularDistance < hitTargetPadding;
  }

  setMouseStart(x: number, y: number): void {
    this.deltaX = x - this.node.x;
    this.deltaY = y - this.node.y;
  }

  cloneWith(props: Partial<Omit<EntryArrow, 'type'>>): EntryArrow {
    return new EntryArrow(
      props.node ?? this.node,
      props.deltaX ?? this.deltaX,
      props.deltaY ?? this.deltaY,
      props.color ?? this.color
    );
  }
}

export function createEntryArrow(node: Circle, deltaX: number, deltaY: number, color: string): EntryArrow {
  return new EntryArrow(node, deltaX, deltaY, color);
}
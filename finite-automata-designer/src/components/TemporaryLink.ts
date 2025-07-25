export class TemporaryLink {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;

  constructor(from: { x: number; y: number }, to: { x: number; y: number }, color: string) {
    this.from = from;
    this.to = to;
    this.color = color;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.from.x, this.from.y);
    ctx.lineTo(this.to.x, this.to.y);
    ctx.stroke();
    const angle = Math.atan2(this.to.y - this.from.y, this.to.x - this.from.x);
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(this.to.x, this.to.y);
    ctx.lineTo(this.to.x - 8 * dx + 5 * dy, this.to.y - 8 * dy - 5 * dx);
    ctx.lineTo(this.to.x - 8 * dx - 5 * dy, this.to.y - 8 * dy + 5 * dx);
    ctx.fill();
  }

  cloneWith(props: Partial<TemporaryLink>): TemporaryLink {
    return new TemporaryLink(
      props.from ?? this.from,
      props.to ?? this.to,
      props.color ?? this.color
    );
  }
}

export function createTemporaryLink(
  from: { x: number; y: number },
  to: { x: number; y: number },
  color: string
): TemporaryLink {
  return new TemporaryLink(from, to, color);
}
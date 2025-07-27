export class Circle {
  x: number;
  y: number;
  radius: number;
  color: string;
  isAccept: boolean;
  text: string;
  mouseOffsetX: number;
  mouseOffsetY: number;

  constructor(
    x: number,
    y: number,
    radius: number,
    color: string,
    isAccept: boolean = false,
    text: string = ''
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.isAccept = isAccept;
    this.text = text;
    this.mouseOffsetX = 0;
    this.mouseOffsetY = 0;
  }

  setMouseStart(x: number, y: number): void {
    this.mouseOffsetX = this.x - x;
    this.mouseOffsetY = this.y - y;
  }

  setAnchorPoint(x: number, y: number): void {
    this.x = x + this.mouseOffsetX;
    this.y = y + this.mouseOffsetY;
  }

  closestPointOnCircle(x: number, y: number): { x: number; y: number } {
    const dx = x - this.x;
    const dy = y - this.y;
    const scale = Math.sqrt(dx * dx + dy * dy);
    return {
      x: this.x + (dx * this.radius) / scale,
      y: this.y + (dy * this.radius) / scale,
    };
  }

  containsPoint(x: number, y: number): boolean {
    return (x - this.x) * (x - this.x) + (y - this.y) * (y - this.y) < this.radius * this.radius;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.stroke();
    if (this.isAccept) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius - 5, 0, 2 * Math.PI);
      ctx.stroke();
    }
    if (this.text) {
      ctx.font = '20px "Times New Roman", serif';
      const width = ctx.measureText(this.text).width;
      ctx.fillText(this.text, this.x - width / 2, this.y + 6);
    }
  }

  cloneWith(props: Partial<Circle>): Circle {
    return new Circle(
      props.x ?? this.x,
      props.y ?? this.y,
      props.radius ?? this.radius,
      props.color ?? this.color,
      props.isAccept ?? this.isAccept,
      props.text ?? this.text
    );
  }

}

export function createCircle(
  x: number,
  y: number,
  radius: number,
  color: string,
  isAccept: boolean = false,
  text: string = ''
): Circle {
  return new Circle(x, y, radius, color, isAccept, text);
}

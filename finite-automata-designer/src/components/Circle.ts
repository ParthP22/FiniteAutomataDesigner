// Circle (aka state node)
export type Circle = {
  type: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  isAccept?: boolean;
  text: string;
  mouseOffsetX: number;
  mouseOffsetY: number;
  setMouseStart: (x: number, y: number) => void;
  setAnchorPoint: (x: number, y: number) => void;
  closestPointOnCircle: (x: number, y: number) => { x: number; y: number };
  containsPoint: (x: number, y: number) => boolean;
  draw: (ctx: CanvasRenderingContext2D) => void;
};

// Factory function to create a Circle
export const createCircle = (
  type: string = 'Circle',
  x: number,
  y: number,
  radius: number,
  color: string,
  isAccept: boolean = false,
  text: string = ''
): Circle => ({
  type: 'Circle',
  x,
  y,
  radius,
  color,
  isAccept,
  text,
  mouseOffsetX: 0,
  mouseOffsetY: 0,
  setMouseStart: function (x: number, y: number) {
    this.mouseOffsetX = this.x - x;
    this.mouseOffsetY = this.y - y;
  },
  setAnchorPoint: function (x: number, y: number) {
    this.x = x + this.mouseOffsetX;
    this.y = y + this.mouseOffsetY;
  },
  
  closestPointOnCircle: function (x: number, y: number) {
    const dx = x - this.x;
    const dy = y - this.y;
    const scale = Math.sqrt(dx * dx + dy * dy);
    return {
      x: this.x + (dx * this.radius) / scale,
      y: this.y + (dy * this.radius) / scale,
    };
  },

  containsPoint: function (x: number, y: number) {
    return (x - this.x) * (x - this.x) + (y - this.y) * (y - this.y) < this.radius * this.radius;
  },

  draw: function (ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.lineWidth = 1;
    // Draw circle
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.stroke();
    // Draw double circle for accept state
    if (this.isAccept) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius - 5, 0, 2 * Math.PI);
      ctx.stroke();
    }
    // Draw text
    if (this.text) {
      ctx.font = '20px "Times New Roman", serif';
      const width = ctx.measureText(this.text).width;
      ctx.fillText(this.text, this.x - width / 2, this.y + 6);
    }
  },
});
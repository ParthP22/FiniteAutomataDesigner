import { drawArrow } from "./draw";

export class TemporaryArrow {
  startPoint: {x: number, y: number};
  endPoint: {x: number, y: number};


  constructor(startPoint: {x: number, y: number}, endPoint: {x: number, y: number}) {
    this.startPoint = startPoint;
    this.endPoint = endPoint;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(this.endPoint.x, this.endPoint.y);
    ctx.lineTo(this.startPoint.x, this.startPoint.y);
    ctx.stroke();

    drawArrow(
      ctx, 
      this.endPoint.x, 
      this.endPoint.y, 
      Math.atan2(this.endPoint.y - this.startPoint.y, this.endPoint.x - this.startPoint.x)
    );
  }
}
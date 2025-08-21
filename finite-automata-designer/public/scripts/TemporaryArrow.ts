/*
 Portions of this file are adapted from:

 Copyright (c) 2010 Evan Wallace
 Finite State Machine Designer (https://madebyevan.com/fsm/)
 Licensed under the MIT License

 Modifications:
 Copyright (c) 2025 Mohammed Mowla and Parth Patel
 Licensed under the MIT Licenses
*/

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
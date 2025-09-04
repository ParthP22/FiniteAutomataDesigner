/*
 Portions of this file are adapted from:

 Copyright (c) 2010 Evan Wallace
 Finite State Machine Designer (https://madebyevan.com/fsm/)
 Licensed under the MIT License

 Modifications:
 Copyright (c) 2025 Mohammed Mowla and Parth Patel
 Licensed under the MIT Licenses
*/

import {Arrow} from "./arrow";
import { nodeRadius, drawText } from "./draw";
import { ExportAsLaTeX } from "../exporting/ExportAsLaTeX";
import { ExportAsSVG } from "../exporting/ExportAsSVG";
import {SelfArrow} from "./SelfArrow";

export var circles: Circle[] = [];

export class Circle {
  x: number;
  y: number;
  mouseOffsetX: number;
  mouseOffsetY: number;
  isAccept: boolean; // Whether or not this state is an accept state
  text: string; // The name of this state that will be displayed
  outArrows: Set<Arrow | SelfArrow>; // The outgoing transitions of this state
  loop: SelfArrow | null; // The SelfArrow which loops back to this state, if it exists

  constructor(x: number, y: number) {
    this.x = x,
    this.y = y;
    this.mouseOffsetX = 0;
    this.mouseOffsetY = 0;
    this.isAccept = false; 
    this.text = ''; 
    this.outArrows = new Set(); 
    this.loop = null; 
  }

  setMouseStart(x: number, y: number): void {
    this.mouseOffsetX = this.x - x;
    this.mouseOffsetY = this.y - y;
  }

  setAnchorPoint(x: number, y: number): void {
    this.x = x + this.mouseOffsetX;
    this.y = y + this.mouseOffsetY;
  }

  draw(ctx: CanvasRenderingContext2D | ExportAsSVG | ExportAsLaTeX) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, nodeRadius, 0, 2 * Math.PI, false);
    ctx.stroke();
    drawText(ctx, this.text, this.x, this.y, null);

    if (this.isAccept) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, nodeRadius - 5, 0, 2 * Math.PI, false);
      ctx.stroke();
    }
  }

  closestPointOnCircle(x: number, y: number) {
    var dx = x - this.x;
    var dy = y - this.y;
    var scale = Math.sqrt(dx * dx + dy * dy);
    return {
      'x': this.x + dx * nodeRadius / scale,
      'y': this.y + dy * nodeRadius / scale
    }
  }

  containsPoint(x: number, y: number) {
    return (x - this.x) * (x - this.x) + (y - this.y) * (y - this.y) < nodeRadius * nodeRadius;
  }
}
/*
 Portions of this file are adapted from:

 Copyright (c) 2010 Evan Wallace
 Finite State Machine Designer (https://madebyevan.com/fsm/)
 Licensed under the MIT License

 Modifications:
 Copyright (c) 2025 Mohammed Mowla and Parth Patel
 Licensed under the MIT Licenses
*/
import { Arrow } from "../Shapes/Arrow";
import { Circle } from "../Shapes/Circle";
import { EntryArrow } from "../Shapes/EntryArrow";
import { SelfArrow } from "../Shapes/SelfArrow";
import { Point } from "./PointInterface";
import { fixed, addCircleComment, addCurvedArrowComment,addStraightArrowComment, addEntryArrowComment, addSelfArrowComment,  textToXML} from "./exportUtils";
export class ExportAsSVG {
    fillStyle: string;
    strokeStyle: string;
    lineWidth: number;
    font: string; 
    _points: Point[];
    _svgData: string;
    _transX: number;
    _transY: number;
    canvas: HTMLCanvasElement;
    faObject: any;

    constructor(canvas: HTMLCanvasElement) {
        if (!canvas) {
            throw new Error('A valid HTMLCanvasElement is required');
        }
        this.canvas = canvas;
        this.fillStyle = 'black';
        this.strokeStyle = 'black';
        this.lineWidth = 1;
        this.font = '12px Arial, sans-serif';
        this._points =[];
        this._svgData = ''; 
        this._transX = 0;
        this._transY = 0;
        this.faObject = null;
    }

    toSVG(): string{
        return '<?xml version="1.0" standalone="no"?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "https://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n\n<svg width="800" height="600" version="1.1" xmlns="http://www.w3.org/2000/svg">\n' + this._svgData + '</svg>\n';
    }

    // Reset 
    beginPath() {
        this._points = [];
    }

    arc(x: number, y: number, radius: number, startAngle:number, endAngle: number, isReversed: boolean) {
        x += this._transX;
        y += this._transY;
        let style = 'stroke="' + this.strokeStyle + '" stroke-width="' + this.lineWidth + '" fill="none"';

        if (endAngle - startAngle == Math.PI * 2) {
            // Comment  for a circle for easy importing
           if (this.faObject instanceof Circle) {
                this._svgData = addCircleComment(this._svgData, this.faObject.id, x, y, this.faObject.isAccept, this.faObject.text);
            }
            this._svgData += '\t<ellipse ' + style + ' cx="' + fixed(x, 3) + '" cy="' + fixed(y, 3) + '" rx="' + fixed(radius, 3) + '" ry="' + fixed(radius, 3) + '"/>\n';
        } else {
            if (this.faObject instanceof Arrow) {
                this._svgData = addCurvedArrowComment(this._svgData, this.faObject.startCircle.id, this.faObject.endCircle.id, this.faObject.parallelPart, this.faObject.perpendicularPart, this.faObject.text);
            } else if (this.faObject instanceof SelfArrow) {
                const centerPoint = this.faObject.getEndPointsAndCircle();
                this._svgData = addSelfArrowComment(this._svgData, this.faObject.circle.id, centerPoint.circleX, centerPoint.circleY, this.faObject.text);
            }
            if (isReversed) {
                let temp = startAngle;
                startAngle = endAngle;
                endAngle = temp;
            }

            if (endAngle < startAngle) {
                endAngle += Math.PI * 2;
            }

            let startX = x + radius * Math.cos(startAngle);
            let startY = y + radius * Math.sin(startAngle);
            let endX = x + radius * Math.cos(endAngle);
            let endY = y + radius * Math.sin(endAngle);
            let useGreaterThan180 = (Math.abs(endAngle - startAngle) > Math.PI);
            let goInPositiveDirection = 1;

            this._svgData += '\t<path ' + style + ' d="';
            this._svgData += 'M ' + fixed(startX, 3) + ',' + fixed(startY, 3) + ' '; // startPoint(startX, startY)
            this._svgData += 'A ' + fixed(radius, 3) + ',' + fixed(radius, 3) + ' '; // radii(radius, radius)
            this._svgData += '0 '; // value of 0 means perfect circle, others mean ellipse
            this._svgData += +useGreaterThan180 + ' ';
            this._svgData += +goInPositiveDirection + ' ';
            this._svgData += fixed(endX, 3) + ',' + fixed(endY, 3); // endPoint(endX, endY)
            this._svgData += '"/>\n';
        }
    };

    moveTo(x: number, y: number) {
    x += this._transX;
    y += this._transY;
    this._points.push({ x, y });
    }

    lineTo(x: number, y: number) {
        x += this._transX;
        y += this._transY;
        this._points.push({ x, y });
    }
    
    stroke() {
        if (this._points.length == 0) return;
        if (this.faObject instanceof Arrow) {
            this._svgData = addStraightArrowComment(this._svgData, this.faObject.startCircle.id, this.faObject.endCircle.id, this.faObject.text);
        } else if (this.faObject instanceof EntryArrow) {
            const points = this.faObject.getEndPoints();
            this._svgData = addEntryArrowComment(this._svgData, this.faObject.pointsToCircle.id, points.startX, points.startY);
        }
        this._svgData += '\t<polygon stroke="' + this.strokeStyle + '" stroke-width="' + this.lineWidth + '" points="';
        for (let i = 0; i < this._points.length; i++) {
            this._svgData += (i > 0 ? ' ' : '') + fixed(this._points[i].x, 3) + ',' + fixed(this._points[i].y, 3);
        }
        this._svgData += '"/>\n';
    }

    fill() {
        if (this._points.length == 0) return;
        this._svgData += '\t<polygon fill="' + this.fillStyle + '" stroke-width="' + this.lineWidth + '" points="';
        for (let i = 0; i < this._points.length; i++) {
            this._svgData += (i > 0 ? ' ' : '') + fixed(this._points[i].x, 3) + ',' + fixed(this._points[i].y, 3);
        }
        this._svgData += '"/>\n';
    };

    measureText(text: string): TextMetrics {
        const c = this.canvas.getContext('2d');
        if (c) {
            c.font = '20px "Times New Roman", serif';
            return c.measureText(text);
        }
        return { width: 0 } as TextMetrics;
    }

    fillText(text: string, x: number, y: number) {
        x += this._transX;
        y += this._transY;
        if (text.replace(' ', '').length > 0) {
            this._svgData += '\t<text x="' + fixed(x, 3) + '" y="' + fixed(y, 3) + '" font-family="Times New Roman" font-size="20">' + textToXML(text) + '</text>\n';
        }
    };

    translate(x: number, y: number) {
        this._transX = x;
        this._transY = y;
    };

    save() {
        // No-op for SVG export
    }

    restore() {
        // No-op for SVG export
    }

    clearRect() {
        // No-op for SVG export
    }

}




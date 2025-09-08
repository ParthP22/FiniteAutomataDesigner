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
import { fixed, addCircleComment, addCurvedArrowComment,addStraightArrowComment, addEntryArrowComment, addSelfArrowComment, CALLERS,  } from "./exportUtils";


export class ExportAsLaTeX {
    strokeStyle: string;
    font: string; 
    _points: Point[];
    _texData: string;
    _scale: number;
    canvas: HTMLCanvasElement;
    faObject: any;

    constructor(canvas: HTMLCanvasElement) {
        if (!canvas) {
            throw new Error('A valid HTMLCanvasElement is required');
        }
        this.canvas = canvas;
        this.strokeStyle = 'black';
        this.font = '20px "Times New Romain", serif';
        this._points =[];
        this._texData = '';
        this._scale = 0.1;
        this.faObject = null;
    }

    toLaTeX(): string{
        return '\\documentclass[12pt]{article}\n' +
				'\\usepackage{tikz}\n' +
				'\n' +
				'\\begin{document}\n' +
				'\n' +
				'\\begin{center}\n' +
				'\\begin{tikzpicture}[scale=0.2]\n' +
				'\\tikzstyle{every node}+=[inner sep=0pt]\n' +
				this._texData +
				'\\end{tikzpicture}\n' +
				'\\end{center}\n' +
				'\n' +
				'\\end{document}\n';
    }

    // Reset 
    beginPath() {
        this._points = [];
    }

arc(x: number, y: number, radius: number, startAngle:number, endAngle: number, isReversed: boolean) {
        let trueX = x;
        let trueY = y;
        x *= this._scale;
        y *= this._scale;
        radius *= this._scale;

        if (endAngle - startAngle == Math.PI * 2) {
            if (this.faObject instanceof Circle) {
                this._texData = addCircleComment(CALLERS.LATEX, this._texData,  this.faObject.id, trueX, trueY, this.faObject.isAccept, this.faObject.text);
            }
            this._texData += '\\draw [' + this.strokeStyle + '] (' + fixed(x, 3) + ',' + fixed(-y, 3) + ') circle (' + fixed(radius, 3) + ');\n';
        } else {
            if (this.faObject instanceof Arrow) {
                this._texData = addCurvedArrowComment(CALLERS.LATEX, this._texData, this.faObject.startCircle.id, this.faObject.endCircle.id, this.faObject.parallelPart, this.faObject.perpendicularPart, this.faObject.text);
            } else if (this.faObject instanceof SelfArrow) {
                const centerPoint = this.faObject.getEndPointsAndCircle();
                this._texData = addSelfArrowComment(CALLERS.LATEX, this._texData, this.faObject.circle.id, centerPoint.circleX, centerPoint.circleY, this.faObject.text);
            }
            if (isReversed) {
                var temp = startAngle;
                startAngle = endAngle;
                endAngle = temp;
            }
            if (endAngle < startAngle) {
                endAngle += Math.PI * 2;
            }
            // TikZ needs the angles to be in between -2pi and 2pi or it breaks
            if (Math.min(startAngle, endAngle) < -2 * Math.PI) {
                startAngle += 2 * Math.PI;
                endAngle += 2 * Math.PI;
            } else if (Math.max(startAngle, endAngle) > 2 * Math.PI) {
                startAngle -= 2 * Math.PI;
                endAngle -= 2 * Math.PI;
            }
            startAngle = -startAngle;
            endAngle = -endAngle;
            this._texData += '\\draw [' + this.strokeStyle + '] (' + fixed(x + radius * Math.cos(startAngle), 3) + ',' + fixed(-y + radius * Math.sin(startAngle), 3) + ') arc (' + fixed(startAngle * 180 / Math.PI, 5) + ':' + fixed(endAngle * 180 / Math.PI, 5) + ':' + fixed(radius, 3) + ');\n';
        }
    };

    moveTo(x: number, y: number) {
        x *= this._scale;
        y *= this._scale;
        this._points.push({ x, y });
    }

    lineTo(x: number, y: number) {
        x *= this._scale;
        y *= this._scale;
        this._points.push({ x, y });
    }
    
    stroke() {
        if (this._points.length == 0) return;
        if (this.faObject instanceof Arrow) {
            this._texData = addStraightArrowComment(CALLERS.LATEX, this._texData, this.faObject.startCircle.id, this.faObject.endCircle.id, this.faObject.text);
        } else if (this.faObject instanceof EntryArrow) {
            const points = this.faObject.getEndPoints();
            this._texData = addEntryArrowComment(CALLERS.LATEX, this._texData, this.faObject.pointsToCircle.id, points.startX, points.startY);
        }
        this._texData += '\\draw [' + this.strokeStyle + ']';
        for (var i = 0; i < this._points.length; i++) {
            var p = this._points[i];
            this._texData += (i > 0 ? ' --' : '') + ' (' + fixed(p.x, 2) + ',' + fixed(-p.y, 2) + ')';
        }
        this._texData += ';\n';
    }

    fill() {
        if (this._points.length == 0) return;
        this._texData += '\\fill [' + this.strokeStyle + ']';
        for (var i = 0; i < this._points.length; i++) {
            var p = this._points[i];
            this._texData += (i > 0 ? ' --' : '') + ' (' + fixed(p.x, 2) + ',' + fixed(-p.y, 2) + ')';
        }
        this._texData += ';\n';
    };

    measureText(text: string): TextMetrics {
        const c = this.canvas.getContext('2d');
        if (c) {
            c.font = '20px "Times New Romain", serif';
			return c.measureText(text);
        }
        return { width: 0 } as TextMetrics;
    }

    fillText(text: string, originalText: string, x: number, y: number, angleOrNull: number | null) {
        if (text.replace(' ', '').length > 0) {
            var nodeParams = '';
            // x and y start off as the center of the text, but will be moved to one side of the box when angleOrNull != null
            if (angleOrNull != null) {
                var width = this.measureText(text).width;
                var dx = Math.cos(angleOrNull);
                var dy = Math.sin(angleOrNull);
                if (Math.abs(dx) > Math.abs(dy)) {
                    if (dx > 0) nodeParams = '[right] ', x -= width / 2;
                    else nodeParams = '[left] ', x += width / 2;
                } else {
                    if (dy > 0) nodeParams = '[below] ', y -= 10;
                    else nodeParams = '[above] ', y += 10;
                }
            }
            x *= this._scale;
            y *= this._scale;
            this._texData += '\\draw (' + fixed(x, 2) + ',' + fixed(-y, 2) + ') node ' + nodeParams + '{$' + originalText.replace(/ /g, '\\mbox{ }') + '$};\n';
        }
    };

    translate() {
        // No-op for LaTeX export
    }

    save() {
        // No-op for LaTeX export
    }

    restore() {
        // No-op for LaTeX export
    }

    clearRect() {
        // No-op for LaTeX export
    }

}
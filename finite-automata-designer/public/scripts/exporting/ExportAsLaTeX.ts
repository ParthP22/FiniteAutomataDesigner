/*
 Portions of this file are adapted from:

 Copyright (c) 2010 Evan Wallace
 Finite State Machine Designer (https://madebyevan.com/fsm/)
 Licensed under the MIT License

 Modifications:
 Copyright (c) 2025 Mohammed Mowla and Parth Patel
 Licensed under the MIT Licenses
*/
export interface Point {
    x: number;
    y: number
}

export class LaTeX {
    fillStyle: string;
    strokeStyle: string;
    lineWidth: number;
    font: string; 
    _points: Point[];
    _texData: string;
    _transX: number;
    _transY: number;
    _scale: number;
    canvas: HTMLCanvasElement;

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
        this._texData = '';
        this._transX = 0;
        this._transY = 0;
        this._scale = 0.1;
        
    }

    toSVG(): string{
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

    // SVG template code to create svg syntax
    arc(x: number, y: number, radius: number, startAngle:number, endAngle: number, isReversed: boolean) {
        x += this._scale;
        y += this._scale;
        radius *= this._scale;

        if (endAngle - startAngle == Math.PI * 2) {
            this._texData += '\\draw [' + this.strokeStyle + '] (' + fixed(x, 3) + ',' + fixed(-y, 3) + ') circle (' + fixed(radius, 3) + ');\n';
        } else {
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
        x += this._scale;
        y += this._scale;
        this._points.push({ x, y });
    }

    lineTo(x: number, y: number) {
        x += this._transX;
        y += this._transY;
        this._points.push({ x, y });
    }
    
    stroke() {
        if (this._points.length == 0) return;
        this._texData += '\t<polygon stroke="' + this.strokeStyle + '" stroke-width="' + this.lineWidth + '" points="';
        for (let i = 0; i < this._points.length; i++) {
            this._texData += (i > 0 ? ' ' : '') + fixed(this._points[i].x, 3) + ',' + fixed(this._points[i].y, 3);
        }
        this._texData += '"/>\n';
    }

    fill() {
        if (this._points.length == 0) return;
        this._texData += '\t<polygon fill="' + this.fillStyle + '" stroke-width="' + this.lineWidth + '" points="';
        for (let i = 0; i < this._points.length; i++) {
            this._texData += (i > 0 ? ' ' : '') + fixed(this._points[i].x, 3) + ',' + fixed(this._points[i].y, 3);
        }
        this._texData += '"/>\n';
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
            this._texData += '\t<text x="' + fixed(x, 3) + '" y="' + fixed(y, 3) + '" font-family="Times New Roman" font-size="20">' + textToXML(text) + '</text>\n';
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

export function fixed(number: number, digits: number): string {
	return number.toFixed(digits).replace(/0+$/, '').replace(/\.$/, '');
}

export function textToXML(text: string): string{
	text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	let result = '';
	for(let i = 0; i < text.length; i++) {
		let c = text.charCodeAt(i);
		if(c >= 0x20 && c <= 0x7E) {
			result += text[i];
		} else {
			result += '&#' + c + ';';
		}
	}
	return result;
}
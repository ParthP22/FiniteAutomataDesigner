import {Circle} from "../Shapes/Circle";
import {Arrow} from "../Shapes/Arrow";
import {SelfArrow} from "../Shapes/SelfArrow";
import {EntryArrow} from "../Shapes/EntryArrow";
// import { Point } from "../exporting/PointInterface";

const startsWith = {
    CIRCLE: 'Circle:',
    STRAIGHT_ARROW: 'StraightArrow:',
    CURVED_ARROW: 'CurvedArrow:',
    SELF_ARROW: 'SelfArrow:',
    ENTRY_ARROW: 'EntryArrow:'
}

export class Importer {
    circles: Circle[];
    arrows: (Arrow | SelfArrow | EntryArrow) [];
    _svgData: string;
    draw: () => void;

    constructor(circArr: Circle[], arrowsArray: (Arrow | SelfArrow | EntryArrow)[], data: string, drawFunc:() => void) {
        this.circles = circArr;
        this.arrows = arrowsArray;
        this._svgData = data;
        this.draw = drawFunc;
    }

    clear(){
        this._svgData = '';
    }

    convert(): void{
        const commentRegex = /<!--\s*(.*?)\s*-->/g;
        let parsedData: string[] = [];
        let match;
        while ((match = commentRegex.exec(this._svgData)) != null) {
            const raw = match[1].trim();
            if (raw.startsWith('Circle')) {
                // Only store circles if they don't exist because accept states draw two circles and have the same comment for the the outer and inner circles
                if (parsedData.indexOf(raw) == -1) {
                    parsedData.push(raw);
                }
            } else {
                parsedData.push(raw);
            }
        }
        // Add the circles first because all arrows depend on them 
        for (let rawData = 0; rawData < parsedData.length; rawData++) {
            const raw = parsedData[rawData];
            if (raw.startsWith(startsWith.CIRCLE)) {
                const [, id, x, y, accept, text] = raw.match(/id=(\w+), x=([\d.]+), y=([\d.]+), accept=(\w+), text=(.*)/)!;
                // Create circle instance
                const circle = new Circle(parseFloat(x), parseFloat(y));
                circle.id = id;
                circle.isAccept = accept == 'true';
                circle.text = text;
                this.circles.push(circle);
            } 
        }
        // Run through the array again and add the arrows with the associated circles
        for (let rawData = 0; rawData < parsedData.length; rawData++) {
            const raw = parsedData[rawData];
            if (raw.startsWith(startsWith.STRAIGHT_ARROW)) {
                const [, from, to, label] = raw.match(/from=(\w+), to=(\w+), label=(.*)/)!;
                const startCircle = this.circles.find(c => c.id === from);
                const endCircle = this.circles.find(c => c.id === to);
                if (startCircle && endCircle) {
                    const arrow = new Arrow(startCircle, endCircle);
                    arrow.text = label.trim();
                    this.arrows.push(arrow);
                }
            } else if (raw.startsWith(startsWith.CURVED_ARROW)) {
                const [, from, to, parallel, perpendicular, label] = raw.match(/from=(\w+), to=(\w+), parallel=([\d.]+), perpendicular=([-]?\d+(?:\.\d+)?), label=(.*)/)!;
                const startCircle = this.circles.find(c => c.id === from);
                const endCircle = this.circles.find(c => c.id === to);
                if (startCircle && endCircle) {
                    const arrow = new Arrow(startCircle, endCircle);
                    arrow.text = label.trim();
                    arrow.parallelPart = parseFloat(parallel);
                    arrow.perpendicularPart = parseFloat(perpendicular);
                    this.arrows.push(arrow);
                }
            } else if (raw.startsWith(startsWith.SELF_ARROW)) {
                const [, circleId, x, y, text] = raw.match(/circle=(\w+), anchor=\(([\d.]+),([\d.]+)\), text=(.*)/)!;
                const circle = this.circles.find(c => c.id === circleId);
                if (circle) {
                    const selfArrow = new SelfArrow(circle, { x: parseFloat(x), y: parseFloat(y)});
                    selfArrow.text = text;
                    this.arrows.push(selfArrow);
                }
            } else if (raw.startsWith(startsWith.ENTRY_ARROW)) {
                const [, toId, x, y] = raw.match(/to=(\w+), start=\(([\d.]+),([\d.]+)\)/)!;
                const circle = this.circles.find(c => c.id === toId);
                if (circle) {
                    const entryArrow = new EntryArrow(circle, { x: parseFloat(x), y: parseFloat(y) });
                    this.arrows.push(entryArrow);
                }
            }
        }

        this.draw();
    }

    normalizeText(text: string) {
        return text.replace(/^\s+|\s+$/g, "").replace(/\s+/g, " ");
    }
}
import {Circle, circles} from "../Shapes/Circle";
import {Arrow, arrows} from "../Shapes/Arrow";
import {SelfArrow} from "../Shapes/SelfArrow";
import {EntryArrow,startState, setStartState} from "../Shapes/EntryArrow";

export class ImportAsSVG {
    circles: Circle[];
    arrows: (Arrow | SelfArrow | EntryArrow) [];
    _svgData: string;

    constructor(circArr: Circle[], arrowsArray: (Arrow | SelfArrow | EntryArrow)[], data: string) {
        this.circles = circArr;
        this.arrows = arrowsArray;
        this._svgData = data;
    }

    clear(){
        this._svgData = '';
    }

    convert(): void{
        console.log("ran");
        let data_lines = this._svgData.split('\n');
        const cleaned: string[] = [];
        for (let i = 0; i < data_lines.length; i++) {
            const s = data_lines[i].replace(/\s+/g, " ").trim();
            if (s) cleaned.push(s);
        }

        for (let line in cleaned){
            console.log(cleaned[line]);
        }
    }

    normalizeText(text: string) {
        return text.replace(/^\s+|\s+$/g, "").replace(/\s+/g, " ");
    }
}
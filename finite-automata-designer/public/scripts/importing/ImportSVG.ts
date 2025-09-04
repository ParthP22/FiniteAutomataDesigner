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
        let split_by_line = this._svgData.split('\n')
        for (let ele in split_by_line) {
            console.log(ele);
        } 
    }
}
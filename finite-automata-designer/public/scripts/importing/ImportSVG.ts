import {Circle, circles} from "../Shapes/Circle";
import {Arrow, arrows} from "../Shapes/arrow";
import {SelfArrow} from "../Shapes/SelfArrow";
import {EntryArrow,startState, setStartState} from "../Shapes/EntryArrow";
import {TemporaryArrow} from "../Shapes/TemporaryArrow";

export class ImportAsSVG {
    circles: Circle[];
    arrows: Arrow | SelfArrow | EntryArrow [];

    constructor(circArr: Circle[]) {
        this.circles = circArr;
    }
}
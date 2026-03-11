import { Arrow } from "../../../../public/scripts/Shapes/Arrow";
import { SelfArrow } from "../../../../public/scripts/Shapes/SelfArrow";
import { SerializedArrow } from "../types";

export function serializeArrow(arrow: Arrow | SelfArrow): SerializedArrow{
    const base = {
        id: arrow.id,
        from: arrow.startCircle.id,
        to: arrow.endCircle.id,
        transition: Array.from(arrow.transition)
    }
    
    if(arrow instanceof Arrow){
        return {
            ...base,
            parallelPart: arrow.parallelPart,
            perpendicularPart: arrow.perpendicularPart,
            lineAngleAdjust: arrow.lineAngleAdjust
        }
    }
    else{
        return {
            ...base,
            anchorAngle: arrow.anchorAngle
        }
    }
}
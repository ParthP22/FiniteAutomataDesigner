import { Arrow } from "../../../public/scripts/Shapes/Arrow";
import { SerializedTransition } from "./types";

export function serializeArrow(arrow: Arrow): SerializedTransition{
    return {
        id: arrow.id,
        from: arrow.startCircle.id,
        to: arrow.endCircle.id,
        transition: Array.from(arrow.transition),
        parallelPart: arrow.parallelPart,
        perpendicularPart: arrow.perpendicularPart,
        lineAngleAdjust: arrow.lineAngleAdjust
    }
}
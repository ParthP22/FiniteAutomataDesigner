import { Circle } from "../../../../public/scripts/Shapes/Circle";
import { SerializedCircle } from "../types";

export function serializeCircle(circle: Circle): SerializedCircle {
    return {
        id: circle.id,
        x: circle.x,
        y: circle.y,
        isAccept: circle.isAccept,
        text: circle.text
    }
}
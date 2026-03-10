import { Circle } from "../../../public/scripts/Shapes/Circle";
import { SerializedState } from "./types";

export function serializeCircle(circle: Circle): SerializedState {
    return {
        id: circle.id,
        x: circle.x,
        y: circle.y,
        isAccept: circle.isAccept,
        text: circle.text
    }
}
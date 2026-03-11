import { Circle } from "../../../../public/scripts/Shapes/Circle";
import { SerializedCircle } from "../types";

export function deserializeCircle(data: SerializedCircle): Circle {
    const circle = new Circle(data.x, data.y);
    
    circle.id = data.id;
    circle.isAccept = data.isAccept;

    return circle;
}
import { Arrow } from "../../../../public/scripts/Shapes/Arrow"
import { SerializedArrow } from "../types"
import { Circle } from "../../../../public/scripts/Shapes/Circle"

export function deserializeArrow(
  data: SerializedArrow,
  circleMap: Map<string, Circle>
): Arrow {

  const fromCircle = circleMap.get(data.from);
  const toCircle = circleMap.get(data.to);

  if (!fromCircle || !toCircle) {
    throw new Error("Arrow references missing circle");
  }

  const arrow = new Arrow(fromCircle, toCircle);

  arrow.id = data.id;
  arrow.text = data.transition.join(",");

  return arrow;
}
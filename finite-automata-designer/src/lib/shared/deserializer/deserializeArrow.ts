import { Arrow } from "../../../../public/scripts/Shapes/Arrow"
import { SerializedArrow } from "../types"
import { Circle } from "../../../../public/scripts/Shapes/Circle"
import { SelfArrow } from "../../../../public/scripts/Shapes/SelfArrow";

export function deserializeArrow(
  data: SerializedArrow,
  circleMap: Map<string, Circle>
): Arrow | SelfArrow{

  const fromCircle = circleMap.get(data.from);
  const toCircle = circleMap.get(data.to);

  if (!fromCircle || !toCircle) {
    throw new Error("Arrow references missing circle");
  }


  const arrow = 
    (fromCircle === toCircle) ? 
    new SelfArrow(fromCircle, toCircle) : 
    new Arrow(fromCircle, toCircle);

  arrow.id = data.id;
  arrow.text = data.transition.join(",");
  arrow.transition = new Set<string>(data.transition);

  if(arrow instanceof Arrow){
    arrow.lineAngleAdjust = data.lineAngleAdjust!;
    arrow.parallelPart = data.parallelPart!;
    arrow.perpendicularPart = data.perpendicularPart!;
  }
  if(arrow instanceof SelfArrow){
    arrow.anchorAngle = data.anchorAngle!;
  }
  

  return arrow;
}
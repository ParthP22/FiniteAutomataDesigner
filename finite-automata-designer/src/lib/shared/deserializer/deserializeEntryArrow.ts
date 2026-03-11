import { EntryArrow } from "../../../../public/scripts/Shapes/EntryArrow"
import { SerializedEntryArrow } from "../types"
import { Circle } from "../../../../public/scripts/Shapes/Circle"

export function deserializeEntryArrow(
  data: SerializedEntryArrow,
  circleMap: Map<string, Circle>
): EntryArrow {

  const circle = circleMap.get(data.startState!);

  if (circle === undefined) {
    throw new Error("EntryArrow references missing circle");
  }
  else{
    const entryArrow = new EntryArrow(circle, data.startPoint!);

    entryArrow.deltaX = data.deltaX!;
    entryArrow.deltaY = data.deltaY!;

    return entryArrow;
  }

  
}
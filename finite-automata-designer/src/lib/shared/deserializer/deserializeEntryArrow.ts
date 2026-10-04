import { EntryArrow } from "../../../../public/scripts/Shapes/EntryArrow"
import { SerializedEntryArrow } from "../types"
import { Circle } from "../../../../public/scripts/Shapes/Circle"

export function deserializeEntryArrow(
  data: SerializedEntryArrow | null | undefined,
  circleMap: Map<string, Circle>
): EntryArrow | null {

  // serializeEntryArrow writes {} when the automaton has no start state yet,
  // so a missing startState is valid data, not corruption.
  if (!data || data.startState === undefined) {
    return null;
  }

  const circle = circleMap.get(data.startState);

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

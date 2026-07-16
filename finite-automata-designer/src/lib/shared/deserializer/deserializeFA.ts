import { SerializedFA } from "../types"
import { deserializeCircle } from "./deserializeCircle"
import { deserializeArrow } from "./deserializeArrow"
import { deserializeEntryArrow } from "./deserializeEntryArrow"
import { Circle } from "../../../../public/scripts/Shapes/Circle"
import { Arrow } from "../../../../public/scripts/Shapes/Arrow"
import { EntryArrow } from "../../../../public/scripts/Shapes/EntryArrow"
import { SelfArrow } from "../../../../public/scripts/Shapes/SelfArrow"

export type DFSMObjects = {
  circles: Circle[],
  arrows: (Arrow | SelfArrow)[],
  entryArrow: EntryArrow,
  alphabet: Set<string>,
}

export function deserializeFA(data: SerializedFA): DFSMObjects {

  const circles: Circle[] = []
  const arrows: (Arrow | SelfArrow)[] = []

  const circleMap = new Map<string, Circle>()

  /*
  Step 1: Create circles
  */

  for (const c of data.circles) {
    const circle = deserializeCircle(c)

    circles.push(circle)
    circleMap.set(c.id, circle)
  }

  /*
  Step 2: Create arrows
  */

  for (const a of data.arrows) {
    const arrow = deserializeArrow(a, circleMap);
    arrows.push(arrow);

    // reconnect circle adjacency
    arrow.startCircle.outArrows.add(arrow)
  }

  /*
  Step 3: Entry Arrow
  */

  const entryArrow = deserializeEntryArrow(data.entryArrow, circleMap)

  /*
  Step 4: Alphabet
  */

  const alphabet = new Set(data.alphabet)

  return {
    circles,
    arrows,
    entryArrow,
    alphabet
  }
}
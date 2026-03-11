import { serializeCircle } from "../shared/serializeCircle";
import { serializeArrow } from "../shared/serializeArrow";
import { SerializedDFA } from "./types";
import { Circle } from "../../../public/scripts/Shapes/Circle";
import { Arrow } from "../../../public/scripts/Shapes/Arrow";
import { SelfArrow } from "../../../public/scripts/Shapes/SelfArrow";
import { alphabet } from "../../../public/scripts/alphabet";
import { startState } from "../../../public/scripts/Shapes/EntryArrow";
import { arrows } from "../../../public/scripts/Shapes/Arrow";
import { circles } from "../../../public/scripts/Shapes/Circle";
import { serializeEntryArrow } from "../shared/serializeEntryArrow";

export function serializeDFA(
): SerializedDFA {
    return {
        alphabet: Array.from(alphabet),
        states: circles.map(serializeCircle),
        transitions: arrows.map(serializeArrow),
        entryArrow: serializeEntryArrow(startState)
    }
}


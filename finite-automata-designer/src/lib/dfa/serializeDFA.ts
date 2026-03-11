import { serializeCircle } from "../shared/serializer/serializeCircle";
import { serializeArrow } from "../shared/serializer/serializeArrow";
import { SerializedDFA } from "./types";
import { Circle } from "../../../public/scripts/Shapes/Circle";
import { Arrow } from "../../../public/scripts/Shapes/Arrow";
import { SelfArrow } from "../../../public/scripts/Shapes/SelfArrow";
import { alphabet } from "../../../public/scripts/alphabet";
import { startState } from "../../../public/scripts/Shapes/EntryArrow";
import { arrows } from "../../../public/scripts/Shapes/Arrow";
import { circles } from "../../../public/scripts/Shapes/Circle";
import { serializeEntryArrow } from "../shared/serializer/serializeEntryArrow";

export function serializeDFA(
): SerializedDFA {
    return {
        alphabet: Array.from(alphabet),
        circles: circles.map(serializeCircle),
        arrows: arrows.map(serializeArrow),
        entryArrow: serializeEntryArrow(startState)
    }
}


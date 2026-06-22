import { serializeCircle } from "../shared/serializer/serializeCircle";
import { serializeArrow } from "../shared/serializer/serializeArrow";
import { SerializedNFA } from "./types";
import { EntryArrow } from "../../../public/scripts/Shapes/EntryArrow";
import { Arrow } from "../../../public/scripts/Shapes/Arrow";
import { Circle } from "../../../public/scripts/Shapes/Circle";
import { serializeEntryArrow } from "../shared/serializer/serializeEntryArrow";
import { SelfArrow } from "../../../public/scripts/Shapes/SelfArrow";

export function serializeNFA(
    alphabet: Set<string>,
    circles: Circle[],
    arrows: (Arrow | SelfArrow)[],
    startState: EntryArrow | null
): SerializedNFA {
    console.log(circles);
    console.log(circles.map(serializeCircle));
    return {
        alphabet: Array.from(alphabet),
        circles: circles.map(serializeCircle),
        arrows: arrows.map(serializeArrow),
        entryArrow: serializeEntryArrow(startState)
    }
}


import { serializeCircle } from "./serializeCircle";
import { serializeArrow } from "./serializeArrow";
import { SerializedFA } from "../types";
import { EntryArrow } from "../../../../public/scripts/Shapes/EntryArrow";
import { Arrow } from "../../../../public/scripts/Shapes/Arrow";
import { Circle } from "../../../../public/scripts/Shapes/Circle";
import { serializeEntryArrow } from "../../shared/serializer/serializeEntryArrow";
import { SelfArrow } from "../../../../public/scripts/Shapes/SelfArrow";

export function serializeFA(
    alphabet: Set<string>,
    circles: Circle[],
    arrows: (Arrow | SelfArrow)[],
    startState: EntryArrow | null
): SerializedFA {
    console.log(circles);
    console.log(circles.map(serializeCircle));
    return {
        alphabet: Array.from(alphabet),
        circles: circles.map(serializeCircle),
        arrows: arrows.map(serializeArrow),
        entryArrow: serializeEntryArrow(startState)
    }
}


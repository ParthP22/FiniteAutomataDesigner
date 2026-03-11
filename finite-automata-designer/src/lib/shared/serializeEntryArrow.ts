import { EntryArrow } from "../../../public/scripts/Shapes/EntryArrow";
import { SerializedEntryArrow } from "./types";

export function serializeEntryArrow(entryArrow: EntryArrow | null): SerializedEntryArrow{
    if(entryArrow === null){
        return {};
    }

    return {
        startState: entryArrow.pointsToCircle.id,
        deltaX: entryArrow.deltaX,
        deltaY: entryArrow.deltaY
    }
}
import { SerializedEntryArrow, SerializedCircle, SerializedArrow } from "../shared/types"

export type SerializedNDFSM = {
    alphabet: string[];
    circles: SerializedCircle[];
    arrows: SerializedArrow[];
    entryArrow: SerializedEntryArrow;
}
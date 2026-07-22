import { SerializedEntryArrow, SerializedCircle, SerializedArrow } from "../shared/types"

export type SerializedDFSM = {
    alphabet: string[];
    circles: SerializedCircle[];
    arrows: SerializedArrow[];
    entryArrow: SerializedEntryArrow;
}
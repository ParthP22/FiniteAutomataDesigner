import { SerializedEntryArrow, SerializedCircle, SerializedArrow } from "../shared/types"

export type SerializedDFA = {
    alphabet: string[];
    circles: SerializedCircle[];
    arrows: SerializedArrow[];
    entryArrow: SerializedEntryArrow;
}
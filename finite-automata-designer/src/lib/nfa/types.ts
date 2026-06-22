import { SerializedEntryArrow, SerializedCircle, SerializedArrow } from "../shared/types"

export type SerializedNFA = {
    alphabet: string[];
    circles: SerializedCircle[];
    arrows: SerializedArrow[];
    entryArrow: SerializedEntryArrow;
}
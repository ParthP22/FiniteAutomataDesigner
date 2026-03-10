import { SerializedState, SerializedTransition } from "../shared/types"

export type SerializedDFA = {
    alphabet: string[];
    states: SerializedState[];
    transitions: SerializedTransition[];
    startState: string;
}
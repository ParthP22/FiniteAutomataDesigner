import { SerializedDFA } from "../dfa/types";

export type SerializedCircle = {
    id: string;
    x: number;
    y: number;
    isAccept: boolean;
    text: string;
}

export type SerializedArrow = {
    id: string;
    from: string;
    to: string;
    transition: string[];

    // Attributes for Arrow
    parallelPart?: number;
    perpendicularPart?: number;
    lineAngleAdjust?: number;

    // Attributes for SelfArrow
    anchorAngle?: number;

}

export type SerializedEntryArrow = {
    startState?: string;
    deltaX?: number;
    deltaY?: number;
    startPoint?: {x: number, y: number};
}

export interface FiniteAutomaton {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    type: "DFA" | "NFA";
    automaton: SerializedDFA;
    created_at: string;
    updated_at: string;
}
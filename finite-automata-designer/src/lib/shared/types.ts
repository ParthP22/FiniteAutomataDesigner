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

export type SerializedFA = {
    alphabet: string[];
    circles: SerializedCircle[];
    arrows: SerializedArrow[];
    entryArrow: SerializedEntryArrow;
}

export interface CreateAutomaton {
    user_id: string;
    name?: string | null;
    description?: string | null;
    type: "DFSM" | "NDFSM";
    automaton: SerializedFA;
}

export interface FiniteAutomaton extends CreateAutomaton {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}
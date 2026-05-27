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
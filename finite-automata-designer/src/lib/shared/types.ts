export type SerializedState = {
    id: string;
    x: number;
    y: number;
    isAccept: boolean;
    text: string;
}

export type SerializedTransition = {
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
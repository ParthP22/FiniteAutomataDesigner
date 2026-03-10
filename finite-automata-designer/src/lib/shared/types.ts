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
    parallelPart: number;
    perpendicularPart: number;
    lineAngleAdjust: number;
}
export type Token = 
    | { type: "symbol"; value: string }
    | { type: "epsilon" };
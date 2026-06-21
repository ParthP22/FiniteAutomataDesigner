"use client";

interface RunButton{
    type: "DFA" | "NFA";
}

export default function RunButton({ type }: RunButton){
    return (
        <button
            id={`${type.toLowerCase()}RunButton`}
            type="button"
            className="flex-none px-8 py-3 bg-gray-700 text-white rounded hover:bg-black transition"
        >
            Run
        </button>
    );
}
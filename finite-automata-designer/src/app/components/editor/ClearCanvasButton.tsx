"use client";

export default function ClearCanvasButton(){
    return (
        <div className="mt-4 flex justify-center">
            <button
                id="clearCanvas"
                type="button"
                className="bg-gray-700 text-white px-6 py-3 rounded hover:bg-gray-500 transition"
            >
                Clear Canvas
            </button>
        </div>
    );
}
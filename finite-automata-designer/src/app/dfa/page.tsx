'use client';
import FiniteAutomataCanvas from "@/components/Canvas";
import Link from "next/link";
import { useRef } from "react";

export default function DFAPage() {
    const canvasRef = useRef<{ clear: () => void }>(null);

    const handleClear = () => {
        canvasRef.current?.clear(); // safe call if the ref is defined
    };

    return (
      <main className="min-h-screen bg-blue-100 flex flex-col">
        {/* Back Button to return to Home Page */}
        <Link href="/" className="absolute bottom-4 left-4 px-6 py-3 bg-gray-700 text-white rounded hover:bg-black transition">
            ← Back
        </Link>

        {/* Run button to run the DFA with the given input string */}
        <Link href="/" className="absolute bottom-4 right-4 px-8 py-3 bg-gray-700 text-white rounded hover:bg-black transition">
            Run
        </Link>
        
        {/* DFA title at the top */}
        <h1 className="relative text-5xl font-bold text-center mt-8 text-black">
            <span className="relative z-10 drop-shadow-[0_0_1px_rgba(0,0,0,0.7)]">
                Deterministic Finite Automata
            </span>
            <span className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/30 via-white/10 to-transparent opacity-20 rounded pointer-events-none"></span>
        </h1>

        <FiniteAutomataCanvas ref={canvasRef}/>
        <div className="mt-4 flex justify-center">
            <button
                type="button"
                onClick={handleClear}
                className="bg-gray-700 text-white px-6 py-3 rounded hover:bg-gray-500 transition">
                    Clear Canvas
                </button>
                
        </div>
        <div className="my-4 flex justify-center text-black">
            <div className="text-center">
                <p className="underline font-bold">Instructions</p>
            <ul className="list-disc text-left">
                <li><p className="font-semibold inline">Add a state:</p> Double-click on the canvas</li>
                <li><p className="font-semibold inline">Add an arrow:</p> Shift + Drag the mouse on the canvas</li>
                <li><p className="font-semibold inline">Move anything:</p> Drag it around</li>
                <li><p className="font-semibold inline">Delete anything:</p> Click it and press the delete key (not backspace)</li>
                <li><p className="font-semibold inline">Make accept state:</p> Double-click an existing state</li>
                <li><p className="font-semibold inline">Type numeric subscript:</p>Put an underscore before the number (ex: "q_0")</li>
                
            </ul>
            </div>

        </div>


        {/* Textbox for inputting strings */}
        <div className="absolute bottom-80 left-4 w-50">
            <label htmlFor="inputString" className="block mb-1 text-gray-700 text-xl font-bold">
                Input:
            </label>
            <input
                type="text"
                placeholder="Enter a string..."
                className="w-full px-4 py-2 border border-gray-400 rounded shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
        </div>

        {/* Textbox for inputting the alphabet */}
        <div className="absolute bottom-60 left-4 w-50">
            <label htmlFor="alphabet" className="block mb-1 text-gray-700 text-xl font-bold">
                Alphabet:
            </label>
            <input
                type="text"
                placeholder="Enter an alphabet..."
                className="w-full px-4 py-2 border border-gray-400 rounded shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
        </div>
      </main>
      
    );
}
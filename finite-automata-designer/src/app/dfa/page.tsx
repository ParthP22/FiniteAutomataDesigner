'use client';
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import Script from 'next/script';
import { lastEditedArrow } from "../../../public/scripts/dfaCanvas";
import { transitionDeterminismCheck } from "@/lib/dfa/dfa";
// import { inputDeterminismCheck } from "../../../public/scripts/dfaCanvas";

export default function DFAPage() {
    const canvasRef = useRef<{ clear: () => void }>(null);

    const [inputString, setInputString] = useState("");
    const [alphabet, setAlphabet] = useState("");
    // const [result, setResult] = useState<null | boolean>(null);
    const [typingMode, setTypingMode] = useState(false);

    const handleTypingModeOn = (event: React.MouseEvent<HTMLCanvasElement>) => {
        event.preventDefault();
        setTypingMode(true);
    };
    
    // This piece of commented out code below throws an error on NextJS
    // for dfaCanvas.ts, saying 'document' is not defined for the piece
    // of code at the end of that file where you attach the canvas to
    // this file.
    useEffect(() => {
        if(typingMode === false){
            transitionDeterminismCheck(lastEditedArrow);
            //alert("The transitionDeterminismCheck is running!!");
        }
    }, [typingMode]);

    useEffect(() => {
        const handleLeftClick = (event: MouseEvent) => {
        if (event.button === 0) {  // left mouse button
            setTypingMode(false);
        }
        };

        document.addEventListener("mousedown", handleLeftClick);

        return () => {
        document.removeEventListener("mousedown", handleLeftClick);
        };
    }, []);

    const handleRun = () => {
        
        setInputString("");
    };

    const handleClear = () => {
        canvasRef.current?.clear(); // safe call if the ref is defined
    };

    return (
      <main className="min-h-screen bg-blue-100 flex flex-col items-center">

        {/* DFA title at the top */}
        <h1 className="text-5xl font-bold text-center my-2 text-black ">
            <span className="drop-shadow-[0_0_1px_rgba(0,0,0,0.7)]">
                Deterministic Finite Automata
            </span>
            <span className="h-8 bg-gradient-to-b from-white/30 via-white/10 to-transparent opacity-20 rounded pointer-events-none"></span>
        </h1>
        <div id="canvasDiv" className="">
            {/*Canvas for drawing FSM*/}
            <canvas id="DFACanvas" width={800} height={600} className="border border-gray-400 flex-none" onContextMenu={handleTypingModeOn}></canvas>
        </div>
        
        {/* <div className="mt-4 flex justify-center">
            <button
                type="button"
                onClick={handleClear}
                className="bg-gray-700 text-white px-6 py-3 rounded hover:bg-gray-500 transition">
                Clear Canvas
            </button>
                
        </div> */}
        <div className="my-4 w-full px-4 flex justify-between items-start gap-5 text-black">
            {/* Back Button to return to Home Page */}
            <Link href="/" className="px-6 py-3 bg-gray-700 text-white rounded hover:bg-black transition">
                ← Back
            </Link>
            <div className="flex gap-10">
                <div className="text-center">
                <p className="underline font-bold">Instructions</p>
                <ul className="list-disc text-left">
                    <li><p className="font-semibold inline">Add a state: </p>Double-click on the canvas</li>
                    <li><p className="font-semibold inline">Add an arrow: </p>Shift + Drag the mouse on the canvas</li>
                    <li><p className="font-semibold inline">Move anything: </p>Drag it around</li>
                    <li><p className="font-semibold inline">Delete anything: </p>Click it and press the delete key (not backspace)</li>
                    <li><p className="font-semibold inline">Make accept state: </p>Double-click an existing state</li>
                    <li><p className="font-semibold inline">Type numeric subscript: </p>Put an underscore before the number (ex: "q_0")</li>
                </ul>
            </div>
            <div id='inputDiv'className="flex flex-col self-center">
                {/* Textbox for inputting strings */}
                <label htmlFor="inputString" className="block mb-1 text-gray-700 text-xl font-bold">
                    Input:
                </label>
                <input
                    type="text"
                    placeholder="Enter a string..."
                    className="w-full px-4 py-2 border border-gray-400 rounded shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={inputString}
                    onChange={(e) => setInputString(e.target.value)}
                />
                {/* Textbox for inputting the alphabet */}
                <label htmlFor="alphabet" className="block mb-1 text-gray-700 text-xl font-bold">
                    Alphabet:
                </label>
                <input
                    type="text"
                    placeholder="Enter an alphabet..."
                    className="w-full px-4 py-2 border border-gray-400 rounded shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={alphabet}
                    onChange={(e) => setAlphabet(e.target.value)}
                />
            </div>
            </div>
            <div className="flex">
                {/* Run button to run the DFA with the given input string */}
                <Link href="/" className="px-8 py-3 bg-gray-700 text-white rounded hover:bg-black transition">
                    Run
                </Link>
            </div>
        </div>

        <Script src="/scripts/dfaCanvas.js" type="module" strategy="afterInteractive" crossOrigin="anonymous"/>
      </main>
      
    );
}
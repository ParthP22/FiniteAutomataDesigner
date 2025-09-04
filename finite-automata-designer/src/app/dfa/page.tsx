'use client';
import Link from "next/link";
import { useRef} from "react";
import Script from 'next/script';

export default function DFAPage() {
    const canvasRef = useRef<{ clear: () => void }>(null);
    

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
            <canvas id="DFACanvas" width={800} height={600} className="rounded-lg border border-gray-400 flex-none"></canvas>
            <div className="text-center text-black mt-2">
                Export as:{' '}
                <button id='svgExportBtn' type="button" className="cursor-pointer text-center">SVG</button>
                {' | '}
                <button id='latexExportBtn' type="button" className="cursor-pointer">LaTeX</button>
                <br />
                Import as:{' '}
                <button id='svgImportBtn' type="button" className="cursor-pointer text-center">SVG</button>
                {' | '}
                <button id='latexImportBtn' type="button" className="cursor-pointer">LaTeX</button>
            </div>
            <div id="exportOutputContainer" hidden className="text-center">
                <textarea 
                disabled
                tabIndex={-1}
                id="output"
                className="w-full h-24 mt-2 border border-gray-400 rounded text-black bg-white select-none" 
                placeholder="Export will appear here...">
                </textarea>
                <div className="flex gap-4 justify-center text-black">
                     <button id='hideOutput' type="button" className="cursor-pointer text-center text-decoration underline">Hide Export Output</button>
                     <button id='copyOutput' type="button" className="cursor-pointer text-center text-decoration underline">Copy Output</button>
                </div>
            </div>
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
                    <li><p className="font-semibold inline">Define start state: </p>Shift + Click empty space on canvas + Drag your desired start state</li>
                    <li><p className="font-semibold inline">Add an arrow between states: </p>Shift + Click initial state + Drag the mouse to your desired terminal state</li>
                    <li><p className="font-semibold inline">Add a looped arrow on a state: </p>Shift + Click existing state</li>
                    <li><p className="font-semibold inline">Curve arrows: </p>Click your desired arrow and drag in the direction you wish to curve it</li>
                    <li><p className="font-semibold inline">Move anything: </p>Click + Drag it around</li>
                    <li><p className="font-semibold inline">Delete anything: </p>Click it and press the delete key (not backspace)</li>
                    <li><p className="font-semibold inline">Make accept state: </p>Double-click an existing state</li>
                    <li><p className="font-semibold inline">Type onto arrow or state: </p>Click on desired state, then begin typing. Click again anywhere else to submit</li>
                    <li><p className="font-semibold inline">Type numeric subscript: </p>Put an underscore before the number (ex: "q_0")</li>
                    <li><p className="font-semibold inline">Set alphabet: </p>Type a comma-separated list of all the characters you wish to define for your DFA. Press Enter to submit</li>
                    <li><p className="font-semibold inline">Run DFA: </p>Type an input string containing only the characters from your alphabet. Press Enter to submit</li>
                </ul>
            </div>
            <div id='inputDiv'className="flex flex-col self-center">
                {/* Textbox for inputting strings */}
                <label htmlFor="inputString" className="block mb-1 text-gray-700 text-xl font-bold">
                    Input:
                </label>
                <input
                    id="inputString"
                    type="text"
                    placeholder="Enter a string..."
                    className="w-full px-4 py-2 border border-gray-400 rounded shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    // Loose focus after you press enter
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                        e.currentTarget.blur();
                        }
                    }}
                />
                {/* Textbox for inputting the alphabet */}
                <label id="alphabetLabel" htmlFor="alphabet" className="block mb-1 text-gray-700 text-xl font-bold">
                    Alphabet: {"{0,1}"}
                </label>
                <input
                    id="alphabet"
                    type="text"
                    placeholder="Enter an alphabet..."
                    className="w-full px-4 py-2 border border-gray-400 rounded shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    // Loose focus after you press enter
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                        e.currentTarget.blur();
                        }
                    }}
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
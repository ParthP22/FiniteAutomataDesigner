'use client';
import Link from "next/link";
import Script from 'next/script';
import { useEffect, useState, Suspense, useRef } from "react";
// import { useSearchParams } from "next/navigation";
import { toggle_visiblity } from "../../../public/scripts/canvasUtil/canvasUtil";
import Instructions from "../components/editor/Instructions";


function NFAPageContent() {

    const [hasMultiCharAlphabet, setHasMultiCharAlphabet] = useState(false);
    const [alphabetInput, setAlphabetInput] = useState("");
    const [exportOpen, setExportOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    // const searchParams = useSearchParams();
    // const id = searchParams?.get("id");

    const exportMenuRef = useRef<HTMLDivElement>(null);
    const importMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        // This will listen for alphabet updates from the canvas script
        const handler = (event: Event) => {
            const customEvent = event as CustomEvent<{alphabet: string[]}>;
            const symbols = customEvent.detail.alphabet;

            const alphabetString = symbols.join(',');
            setAlphabetInput(alphabetString);

            const hasMulti = symbols.some(symbol => symbol.length > 1);
            setHasMultiCharAlphabet(hasMulti);
        }

        window.addEventListener("nfaAlphabetUpdated", handler);

        return () => {
            window.removeEventListener("nfaAlphabetUpdated", handler);
        }

    }, [alphabetInput]);

    return (
      <main className="min-h-screen bg-blue-100 flex flex-col items-center">
        {/* NFA title at the top */}
        <h1 className="text-5xl font-bold text-center my-2 text-black ">
            <span className="drop-shadow-[0_0_1px_rgba(0,0,0,0.7)]">
                Non-deterministic Finite Automata
            </span>
            <span className="h-8 bg-gradient-to-b from-white/30 via-white/10 to-transparent opacity-20 rounded pointer-events-none"></span>
        </h1>
        <div className="flex w-full">
            {/* Back Button + Instructions parent div*/}
            <div className="flex-1 flex flex-col items-start h-13 pl-5" >
                {/* Back Button to return to Home Page */}
                <Link href="/" className="px-6 py-3 bg-gray-700 text-white rounded hover:bg-black transition">
                    ← Back
                </Link>
                <Instructions
                    type={"NFA"}
                />
            </div>
            {/* Canvas parent div*/}
            <div>
                <div id="canvasDiv" className="flex flex-col text-black">
                    {/* Canvas for drawing FSM */}
                    <canvas id="NFACanvas" width={800} height={600} className="rounded-lg border border-gray-400"></canvas>
                    {/* Exporting dropdowns container*/}
                    <div className="flex gap-2">
                        <p className="text-lg mt-5">Export as: </p>
                        <div className="relative inline-block text-left mt-5">
                            {/* Exporting options parent selector*/}
                            <button
                                id="exportMenuBtn"
                                type="button"
                                onClick={() => {
                                    if (exportMenuRef.current) toggle_visiblity(exportMenuRef.current);
                                    setExportOpen(prev => !prev);
                                }}
                                className="flex justify-center gap-x-1.5 rounded-md bg-gray-700 text-white px-2 py-1 text-md hover:bg-black transition"
                            >
                                Export Options
                                <svg
                                    className={`-mr-1 h-5 w-5 text-gray-400 h-4 w-4 transition-transform ${exportOpen ? "rotate-180" : ""}`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.939l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.27a.75.75 0 01-.02-1.06z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>

                            {/* Export Menu options (SVG and LaTeX)*/}
                            <div
                                ref={exportMenuRef}
                                id="exportMenu"
                                hidden
                                className="absolute mt-2 w-40 rounded-md bg-gray-700 shadow-lg z-20"
                            >
                                <button
                                    id="svgExportBtn"
                                    type="button"
                                    onClick={() => {
                                        if (exportMenuRef.current) toggle_visiblity(exportMenuRef.current);
                                        setExportOpen(false);
                                    }}
                                    className="block w-full px-4 py-2 text-left text-white hover:bg-gray-600"
                                >
                                    SVG
                                </button>
                                <button
                                    id="latexExportBtn"
                                    type="button"
                                    onClick={() => {
                                        if (exportMenuRef.current) toggle_visiblity(exportMenuRef.current);
                                        setExportOpen(false);
                                    }}
                                    className="block w-full px-4 py-2 text-left text-white hover:bg-gray-600"
                                >
                                    LaTeX
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Importing dropdowns container*/}
                    <div className="flex gap-2 mt-2">
                        <p className="text-lg">Import as: </p>
                        <div className="flex gap-2">
                            {/* Importing options parent selector*/}
                            <div className="relative inline-block text-left">
                                <button
                                    id="importMenuBtn"
                                    type="button"
                                    onClick={() => {
                                        if (importMenuRef.current) toggle_visiblity(importMenuRef.current);
                                        setImportOpen(prev => !prev);
                                    }}
                                    className="flex justify-center gap-x-1.5 rounded-md bg-gray-700 text-white px-2 py-1 text-md hover:bg-black transition"
                                >
                                    Import Options
                                    <svg
                                        className={`-mr-1 h-5 w-5 text-gray-400 h-4 w-4 transition-transform ${importOpen ? "rotate-180" : ""}`}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.939l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.27a.75.75 0 01-.02-1.06z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                                {/* Import Menu options (SVG and LaTeX)*/}
                                <div
                                    ref={importMenuRef}
                                    id="importMenu"
                                    hidden
                                    className="absolute mt-2 w-40 rounded-md bg-gray-700 shadow-lg z-20"
                                >
                                    <button
                                    id="svgImportBtn"
                                    type="button"
                                    onClick={() => {
                                        if (importMenuRef.current) toggle_visiblity(importMenuRef.current);
                                        setImportOpen(false);
                                    }}
                                    className="block w-full px-4 py-2 text-left text-white hover:bg-gray-600"
                                    >
                                    Import as SVG
                                    </button>
                                    <button
                                    id="latexImportBtn"
                                    type="button"
                                    onClick={() => {
                                        if (importMenuRef.current) toggle_visiblity(importMenuRef.current);
                                        setImportOpen(false);
                                    }}
                                    className="block w-full px-4 py-2 text-left text-white hover:bg-gray-600"
                                    >
                                    Import as LaTeX
                                    </button>
                                </div>
                            </div>
                            <button
                            id="confirmImport"
                            className="flex justify-center gap-x-1.5 rounded-md bg-gray-700 text-white px-2 py-1 text-md hover:bg-black transition"
                            hidden
                            >
                                Draw Import
                            </button>
                        </div>
                    </div>

                    {/*Leave for now in case we turn back the UI for importing and exporting*/}

                    {/* <div className="text-center text-black mt-2">
                        Export as: <button id='svgExportBtn' type="button" className="cursor-pointer">SVG</button>
                        {' | '} <button id='latexExportBtn' type="button" className="cursor-pointer">LaTeX</button>
                        <br />
                        Import as: <button id='svgImportBtn' type="button" className="cursor-pointer">SVG</button>
                        {' | '} <button id='latexImportBtn' type="button" className="cursor-pointer">LaTeX</button>
                    </div> */}
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
                    <div id="importInputContainer" hidden className="text-center">
                        <textarea
                        tabIndex={-1}
                        id="input"
                        className="w-full h-24 mt-2 border border-gray-400 rounded text-black bg-white select-none"
                        placeholder="Enter the input data that you exported EXCLUSIVELY from this FA designer goes here...">
                        </textarea>
                        <div className="flex gap-4 justify-center text-black">
                            <button id='hideInput' type="button" className="cursor-pointer text-center text-decoration underline">Hide Input</button>
                            <button id='clearInput' type="button" className="cursor-pointer text-center text-decoration underline">Clear Input</button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Right hand parent div*/}
            <div className="flex-1">
                <div className="flex flex-col gap-3 h-13 justify-start-safe pl-5">
                    <div className="flex flex-col gap-5">
                        <div id='inputDiv' className="flex flex-col self-center w-full max-w-md text-black">
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
                            <div className="min-h-[3rem]">
                                {hasMultiCharAlphabet && (
                                    <div className="w-full rounded border border-red-300 bg-red-100 px-3 py-2">
                                        <p className="text-sm text-red-700 font-semibold">
                                            Multi-character element detected in alphabet. Please separate elements
                                            in your input string with commas or spaces.
                                        </p>
                                    </div>
                                )}
                            </div>
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
                        <div className="flex flex-wrap self-center gap-5">
                            {/* Run button to run the NFA with the given input string */}
                            <button
                                id="nfaRunBtn"
                                type="button"
                                className="flex-none px-8 py-3 bg-gray-700 text-white rounded hover:bg-black transition"
                            >
                                Run
                            </button>
                            {/* My Projects button to open the projects page */}
                            <Link
                                href="/projects"
                                className="flex-none px-8 py-3 bg-gray-700 text-white rounded hover:bg-black transition"
                            >
                                My Projects
                            </Link>
                        </div>
                    </div>
                    {/* Clear Canvas parent container */}
                    <div>
                        <div className="mt-4 flex justify-center">
                            <button
                                id="clearCanvas"
                                type="button"
                                className="bg-gray-700 text-white px-6 py-3 rounded hover:bg-gray-500 transition">
                                Clear Canvas
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Script
            src="/scripts/nfa/nfaCanvas.js"
            type="module"
            strategy="afterInteractive"
            crossOrigin="anonymous"
        />
      </main>

    );
}

export default function NFAPage() {
    return (
        <Suspense>
            <NFAPageContent />
        </Suspense>
    );
}

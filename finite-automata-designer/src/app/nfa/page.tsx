'use client';
import Link from "next/link";
import Script from 'next/script';
import { useEffect, useState, Suspense } from "react";
// import { useSearchParams } from "next/navigation";
import Instructions from "../components/editor/Instructions";
import AutomataHeader from "../components/editor/AutomataHeader";
import ImportContainer from "../components/editor/import/ImportContainer";
import ExportContainer from "../components/editor/export/ExportContainer";
import ExportTextArea from "../components/editor/export/ExportTextArea";
import ImportTextArea from "../components/editor/import/ImportTextArea";
import InputString from "../components/editor/InputString";
import AlphabetInput from "../components/editor/alphabet/AlphabetInput";
import AlphabetLabel from "../components/editor/alphabet/AlphabetLabel";


function NFAPageContent() {

    const [hasMultiCharAlphabet, setHasMultiCharAlphabet] = useState(false);
    const [alphabetInput, setAlphabetInput] = useState("");
    // const searchParams = useSearchParams();
    // const id = searchParams?.get("id");

    const title: string = "Non-deterministic Finite Automata";


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
        <AutomataHeader
            title={title}
        />
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
                    <ExportContainer />
                    {/* Importing dropdowns container*/}
                    <ImportContainer />

                    {/*Leave for now in case we turn back the UI for importing and exporting*/}

                    {/* <div className="text-center text-black mt-2">
                        Export as: <button id='svgExportBtn' type="button" className="cursor-pointer">SVG</button>
                        {' | '} <button id='latexExportBtn' type="button" className="cursor-pointer">LaTeX</button>
                        <br />
                        Import as: <button id='svgImportBtn' type="button" className="cursor-pointer">SVG</button>
                        {' | '} <button id='latexImportBtn' type="button" className="cursor-pointer">LaTeX</button>
                    </div> */}

                    <ExportTextArea />

                    <ImportTextArea />

                </div>
            </div>

            {/* Right hand parent div*/}
            <div className="flex-1">
                <div className="flex flex-col gap-3 h-13 justify-start-safe pl-5">
                    <div className="flex flex-col gap-5">
                        <div id='inputDiv' className="flex flex-col self-center w-full max-w-md text-black">
                            {/* Textbox for inputting strings */}
                            <InputString />
                            
                            <AlphabetLabel
                                hasMultiCharAlphabet={hasMultiCharAlphabet}
                            />
                            
                            <AlphabetInput />
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

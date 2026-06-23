'use client';

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
import RunButton from "../components/editor/RunButton";
import ProjectsButton from "../components/editor/ProjectsButton";
import ClearCanvasButton from "../components/editor/ClearCanvasButton";
import BackButton from "../components/editor/BackButton";
import { useRouter } from 'next/navigation';


function NFAPageContent() {

    const [hasMultiCharAlphabet, setHasMultiCharAlphabet] = useState(false);
    const [alphabetInput, setAlphabetInput] = useState("");
    const [name, setName] = useState<string | null>(null);
    const [description, setDescription] = useState<string | null>(null);

    const router = useRouter();

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
                <BackButton />
                
                {/* Instructions dropdown */}
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

                    {/* Exporting text area */}
                    <ExportTextArea />

                    {/* Importing text area */}
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
                            
                            {/* Alphabet display */}
                            <AlphabetLabel
                                hasMultiCharAlphabet={hasMultiCharAlphabet}
                            />
                            
                            {/* Input box for new alphabet */}
                            <AlphabetInput />
                        </div>
                        <div className="flex flex-wrap self-center gap-5">
                            {/* Run button to run the NFA with the given input string */}
                            <RunButton
                                type={"NFA"}
                            />

                            {/* My Projects button to open the projects page */}
                            <ProjectsButton />

                        </div>
                    </div>
                    {/* Clear Canvas parent container */}
                    <div>
                        <ClearCanvasButton />
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

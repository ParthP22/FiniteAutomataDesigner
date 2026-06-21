'use client';
import Link from "next/link";
import Script from 'next/script';
import { useEffect, useState, Suspense, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { saveAutomaton, updateAutomaton } from "@/lib/automata/mutations";
import { FiniteAutomaton } from "@/lib/shared/types";
import { getAutomaton } from "@/lib/automata/queries";
import { SaveProjectModal } from "@/app/components/projects/SaveProjectModal";
import Instructions from "@/app/components/editor/Instructions";
import AutomataHeader from "@/app/components/editor/AutomataHeader";
import ImportContainer from "@/app/components/editor/import/ImportContainer";
import ExportContainer from "@/app/components/editor/export/ExportContainer";
import ExportTextArea from "@/app/components/editor/export/ExportTextArea";
import InputString from "@/app/components/editor/InputString";
import AlphabetInput from "@/app/components/editor/alphabet/AlphabetInput";
import AlphabetLabel from "@/app/components/editor/alphabet/AlphabetLabel";
import RunButton from "@/app/components/editor/RunButton";
import ProjectsButton from "@/app/components/editor/ProjectsButton";
import ClearCanvasButton from "@/app/components/editor/ClearCanvasButton";


function DFAPageContent() {

    const [hasMultiCharAlphabet, setHasMultiCharAlphabet] = useState(false);
    const [alphabetInput, setAlphabetInput] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [name, setName] = useState<string | null>(null);
    const [description, setDescription] = useState<string | null>(null);

    const params = useParams();
    const router = useRouter();

    const automatonId = params?.id as string;

    // Holds automaton data fetched before the canvas script has finished loading.
    // onReady on the <Script> tag drains this once the script is ready.
    const pendingAutomaton = useRef<unknown>(null);

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

        window.addEventListener("dfaAlphabetUpdated", handler);

        return () => {
            window.removeEventListener("dfaAlphabetUpdated", handler);
        }

    }, [alphabetInput]);

    useEffect(() => {
        // Clear stale pending data whenever the target id changes
        pendingAutomaton.current = null;

        async function loadAutomaton(){
            if(!automatonId){
                return;
            }

            const finiteAutomatonData: FiniteAutomaton = await getAutomaton(automatonId);
            setName(finiteAutomatonData.name);
            setDescription(finiteAutomatonData.description);

            if (typeof window.loadDFAIntoCanvas === 'function') {
                // Canvas script is already loaded — call directly.
                window.loadDFAIntoCanvas(finiteAutomatonData.automaton);
            } else {
                // Canvas script hasn't finished loading yet (production race).
                // Store the data so the onReady callback can deliver it once ready.
                pendingAutomaton.current = finiteAutomatonData.automaton;
            }
        }

        loadAutomaton();
    },[automatonId]);

    async function handleSaveAsNew(newName: string, newDescription: string){

        const serialized = window.exportDFA();
        console.log(serialized);

        try{
            const finiteAutomataData = await saveAutomaton(serialized, newName, newDescription);
            alert("Automaton saved!");
            router.push(`/dfa/${finiteAutomataData.id}`);
        }
        catch (error) {
            console.error(error);
            alert("Save failed: " + error);
        }
    }

    async function handleSave(){
        const serialized = window.exportDFA();
        console.log(serialized);

        try{
            await updateAutomaton(automatonId, serialized);
            alert("Automaton saved!");
        }
        catch (err) {
            console.error(err);
            alert("Save failed.");
        }
    }

    return (
      <main className="min-h-screen bg-blue-100 flex flex-col items-center">
        {/* DFA title at the top */}
        <AutomataHeader
            title={!name ? "Deterministic Finite Automata" : ("DFA: " + name)}
            description={description}
        />
        <div
            className="flex w-full"
        >
            {/* Back Button + Instructions parent div*/}
            <div className="flex-1 flex flex-col items-start h-13 pl-5" >
                {/* Back Button to return to Home Page */}
                <Link href="/" className="px-6 py-3 bg-gray-700 text-white rounded hover:bg-black transition">
                    ← Back
                </Link>
                <Instructions 
                    type={"DFA"}
                />
            </div>
            {/* Canvas parent div*/}
            <div>
                <div id="canvasDiv" className="flex flex-col text-black">
                    {/* Canvas for drawing FSM */}
                    <canvas id="DFACanvas" width={800} height={600} className="rounded-lg border border-gray-400"></canvas>
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
                            {/* Save button to save the DFA to the database only if the user is logged in */}
                            <button
                                type="button"
                                onClick={handleSave}
                                className="flex-none px-8 py-3 bg-gray-700 text-white rounded hover:bg-black transition"
                            >
                                Save
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsSaving(true)}
                                className="flex-none px-8 py-3 bg-gray-700 text-white rounded hover:bg-black transition"
                            >
                                Save As New Project
                            </button>
                    
                            {/* Run button to run the DFA with the given input string */}
                            <RunButton 
                                type={"DFA"}
                            />

                            {/* My Projects button to open the projects page that will list all of the users project when logged in */}
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

        <SaveProjectModal
            isOpen={isSaving}
            initialName={name}
            initialDescription={description}
            onClose={() => setIsSaving(false)}
            onSave={handleSaveAsNew}
        />

        <Script
            src="/scripts/dfa/dfaCanvas.js"
            type="module"
            strategy="afterInteractive"
            crossOrigin="anonymous"
            onReady={() => {
                // Fires when the script first loads AND after every subsequent
                // component mount where the script is already cached.
                // Delivers any automaton data that arrived before the script was ready.
                if (pendingAutomaton.current !== null) {
                    window.loadDFAIntoCanvas(pendingAutomaton.current);
                    pendingAutomaton.current = null;
                }
            }}
        />
      </main>

    );
}

export default function DFAPage() {
    return (
        <Suspense>
            <DFAPageContent />
        </Suspense>
    );
}
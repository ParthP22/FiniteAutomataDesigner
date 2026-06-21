'use client';

import Script from 'next/script';
import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveAutomaton } from "@/lib/automata/mutations";
import { createClient } from "@/lib/supabase/client";
import { SaveProjectModal } from "../components/projects/SaveProjectModal";
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
import SaveActions from '../components/editor/SaveActions';


function DFAPageContent() {

    const [hasMultiCharAlphabet, setHasMultiCharAlphabet] = useState(false);
    const [alphabetInput, setAlphabetInput] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const searchParams = useSearchParams();
    const id = searchParams?.get("id");
    const router = useRouter();

    const title: string = "Deterministic Finite Automata"

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
            if(!id){
                return;
            }

            const supabase = createClient();

            const { data, error } = await supabase
                .from("finite_automata")
                .select("automaton")
                .eq("id",id)
                .single();

            if(error){
                console.error("Error loading automaton: ", error);
                return;
            }

            if(!data){
                console.log("No data");
                return;
            }

            if (typeof window.loadDFAIntoCanvas === 'function') {
                // Canvas script is already loaded — call directly.
                window.loadDFAIntoCanvas(data.automaton);
            } else {
                // Canvas script hasn't finished loading yet (production race).
                // Store the data so the onReady callback can deliver it once ready.
                pendingAutomaton.current = data.automaton;
            }
        }
        loadAutomaton();
    },[id]);

    async function handleSave(name: string, description: string){

        const serialized = window.exportDFA();
        console.log(serialized);

        try{
            const finiteAutomataData = await saveAutomaton(
                serialized, 
                (name.trim() === "") ? null : name.trim(), 
                (description.trim() === "") ? null : description.trim(),
            );
            alert("Automaton saved!");
            router.push(`/dfa/${finiteAutomataData.id}`);
        }
        catch (error) {
            console.error(error);
            alert("Save failed: " + error);
        }
    }

    return (
      <main className="min-h-screen bg-blue-100 flex flex-col items-center">
        {/* DFA title at the top */}
        <AutomataHeader
            title={title}
        />

        <div
            className="flex w-full"
        >
            {/* Back Button + Instructions parent div*/}
            <div className="flex-1 flex flex-col items-start h-13 pl-5" >
                {/* Back Button to return to Home Page */}
                <BackButton />

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
                            {/* Save button to save the DFA to the database only if the user is logged in */}
                            {/* <button
                                type="button"
                                onClick={() => setIsSaving(true)}
                                className="flex-none px-8 py-3 bg-gray-700 text-white rounded hover:bg-black transition"
                            >
                                Save
                            </button> */}

                            <SaveActions
                                onSave={() => setIsSaving(true)}
                            />
                    
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
            initialName={null}
            initialDescription={null}
            onClose={() => setIsSaving(false)}
            onSave={handleSave}
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
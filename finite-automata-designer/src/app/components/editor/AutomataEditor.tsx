"use client";

'use client';

{/* DFA Script */}
import Script from 'next/script';

{/* Hooks */}
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

{/* Components */}
import Instructions from "./Instructions";
import AutomataHeader from "./AutomataHeader";
import ImportContainer from "./import/ImportContainer";
import ExportContainer from "./export/ExportContainer";
import ExportTextArea from "./export/ExportTextArea";
import ImportTextArea from "./import/ImportTextArea";
import InputString from "./InputString";
import AlphabetInput from "./alphabet/AlphabetInput";
import AlphabetLabel from "./alphabet/AlphabetLabel";
import RunButton from "./RunButton";
import ProjectsButton from "./ProjectsButton";
import ClearCanvasButton from "./ClearCanvasButton";
import BackButton from "./BackButton";
import SaveActions from './SaveActions';
import SaveProjectModal from "../projects/SaveProjectModal";

{/* Database/Serialization */}
import { SerializedFA } from '@/lib/shared/types';
import { FiniteAutomaton } from '@/lib/shared/types';
import { getAutomaton } from '@/lib/automata/queries';
import { saveAutomaton, updateAutomaton } from "@/lib/automata/mutations";


export default function AutomataEditor(){

    const [hasMultiCharAlphabet, setHasMultiCharAlphabet] = useState(false);
    const [alphabetInput, setAlphabetInput] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [name, setName] = useState<string | null>(null);
    const [description, setDescription] = useState<string | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const automatonId = searchParams?.get("id") as string;

    // Holds automaton data fetched before the canvas script has finished loading.
    // onReady on the <Script> tag drains this once the script is ready.
    const pendingAutomaton = useRef<SerializedFA | null>(null);

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
            const finiteAutomataData = await saveAutomaton(serialized, newName, newDescription, "DFA");
            alert("Automaton saved!");
            router.push(`/dfa?id=${finiteAutomataData.id}`);
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
            {/* Back Button + Instructions parent div */}
            <div className="flex-1 flex flex-col items-start h-13 pl-5" >
                {/* Back Button to return to Home Page */}
                <BackButton />

                {/* Instructions dropdown */}
                <Instructions 
                    type={"DFA"}
                />

            </div>

            {/* Canvas parent div */}
            <div>
                <div id="canvasDiv" className="flex flex-col text-black">
                    {/* Canvas for drawing FSM */}
                    <canvas id="DFACanvas" width={800} height={600} className="rounded-lg border border-gray-400"></canvas>

                    {/* Exporting dropdowns container */}
                    <ExportContainer />

                    {/* Importing dropdowns container */}
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
                            {/* Save button to save the DFA to the database only if the user is logged in */}
                            {!automatonId ? (
                                <SaveActions
                                    onSave={() => setIsSaving(true)}
                                />
                            ) : ( 
                                <SaveActions
                                    onSave={handleSave}
                                    onSaveAs={() => setIsSaving(true)}
                                />
                            )}
                    
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
            onSave={handleSaveAsNew}
        />

        <Script
            src="/scripts/dfa/dfaCanvas.js"
            type="module"
            strategy="afterInteractive"
            crossOrigin="anonymous"
        />
      </main>

    );
}



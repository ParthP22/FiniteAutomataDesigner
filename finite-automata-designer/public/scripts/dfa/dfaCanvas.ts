/*
 Portions of this file are adapted from:

 Copyright (c) 2010 Evan Wallace
 Finite State Machine Designer (https://madebyevan.com/fsm/)
 Licensed under the MIT License

 Modifications:
 Copyright (c) 2025 Mohammed Mowla and Parth Patel
 Licensed under the MIT Licenses
*/

// Command to compile this file into JS
// npm run build:canvas

// All canvas behavior shared with the NFA designer lives in
// canvasUtil/fsmCanvas.ts. This file supplies the DFA-specific pieces
// plus the database save/load hooks exposed on window.

import { circles } from "../Shapes/Circle";
import { arrows } from "../Shapes/Arrow";
import { startState, setStartState } from "../Shapes/EntryArrow";
import { dfaAlgo, transitionDeterminismCheck } from "../../../src/lib/dfa/dfaAlgo";
import { alphabet, setAlphabet, transitionLabelInputValidator } from "../../../src/lib/dfa/dfaTransitionSymbols";
import { Importer } from "./importing/importer";
import { serializeDFA } from "@/lib/dfa/serializeDFA";
import { deserializeDFA } from "@/lib/dfa/deserializeDFA";
import { SerializedDFA } from "@/lib/dfa/types";
import { initFsmCanvas, clearAutomaton } from "../canvasUtil/fsmCanvas";

// Holds the draw function of the currently mounted canvas so that a DFA
// loaded from the database can trigger a repaint.
let drawRef: (() => void) | null = null;

// Automaton data that arrived before the canvas finished mounting.
let pendingDFA: SerializedDFA | null = null;

(window as any).loadDFAIntoCanvas = function(data: SerializedDFA){

  if(!drawRef){
    pendingDFA = data;
    return;
  }

  loadSerializedDFA(data);
}

window.exportDFA = function(){
  return serializeDFA(
    alphabet,
    circles,
    arrows,
    startState
  );
}

initFsmCanvas({
  automatonLabel: "DFA",
  canvasId: "DFACanvas",
  runBtnId: "dfaRunBtn",
  alphabetUpdatedEventName: "dfaAlphabetUpdated",
  runAlgo: dfaAlgo,
  commitTransition: transitionDeterminismCheck,
  getAlphabet: () => alphabet,
  setAlphabet,
  getValidator: () => transitionLabelInputValidator,
  createImporter: (circs, arrs, data, draw) => new Importer(circs, arrs, data, draw),
  onCanvasReady: (draw) => {
    drawRef = draw;

    if(pendingDFA){
      loadSerializedDFA(pendingDFA);
      pendingDFA = null;
      draw();
    }
  },
});

function loadSerializedDFA(data: SerializedDFA){
  const canvas = document.getElementById("DFACanvas") as HTMLCanvasElement;

  clearAutomaton(canvas);

  const deserialized = deserializeDFA(data);

  circles.push(...deserialized.circles);

  arrows.push(...deserialized.arrows);

  setAlphabet(deserialized.alphabet);

  setStartState(deserialized.entryArrow);

  const alphabetLabel = document.getElementById("alphabetLabel") as HTMLLabelElement | null;
  if(alphabetLabel){
    alphabetLabel.textContent = "Alphabet: {"+Array.from(alphabet).join(",")+"}";
  }

  if(drawRef){
    drawRef();
  }

}

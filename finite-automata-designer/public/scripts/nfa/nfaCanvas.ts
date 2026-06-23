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

// All canvas behavior shared with the DFA designer lives in
// canvasUtil/fsmCanvas.ts. This file only supplies the NFA-specific pieces.

import { commitTransition, nfaAlgo } from "../../../src/lib/nfa/nfaAlgo";
import { alphabet, setAlphabet, transitionLabelInputValidator } from "../../../src/lib/nfa/nfaTransitionSymbols";
import { Importer } from "./importing/importer";
import { clearAutomaton, initFsmCanvas } from "../canvasUtil/fsmCanvas";
import { SerializedFA } from "@/lib/shared/types";
import { serializeFA } from "@/lib/shared/serializer/serializeFA";
import { circles } from "../Shapes/Circle";
import { arrows } from "../Shapes/Arrow";
import { setStartState, startState } from "../Shapes/EntryArrow";
import { deserializeFA } from "@/lib/shared/deserializer/deserializeFA";

let drawRef: (() => void) | null = null;

let pendingNFA: SerializedFA | null = null;

window.loadFAIntoCanvas = function(data: SerializedFA){
  if(!drawRef){
    pendingNFA = data;
    return;
  }

  loadSerializedNFA(data);
}

window.exportFA = function(){
  return serializeFA(
    alphabet,
    circles,
    arrows,
    startState,
  );
}

initFsmCanvas({
  automatonLabel: "NFA",
  canvasId: "NFACanvas",
  runBtnId: "nfaRunBtn",
  alphabetUpdatedEventName: "nfaAlphabetUpdated",
  runAlgo: nfaAlgo,
  commitTransition,
  getAlphabet: () => alphabet,
  setAlphabet,
  getValidator: () => transitionLabelInputValidator,
  createImporter: (circs, arrs, data, draw) => new Importer(circs, arrs, data, draw),
  onCanvasReady: (draw) => {
    drawRef = draw;

    if(pendingNFA){
      loadSerializedNFA(pendingNFA);
      pendingNFA = null;
      draw();
    }
  }
});

function loadSerializedNFA(data: SerializedFA){
  const canvas = document.getElementById("NFACanvas") as HTMLCanvasElement;

  clearAutomaton(canvas);

  const deserialized = deserializeFA(data);

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

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

// All canvas behavior shared with the DFSM designer lives in
// canvasUtil/fsmCanvas.ts. This file only supplies the NDFSM-specific pieces.

import { commitTransition, ndfsmAlgo } from "../../../src/lib/ndfsm/ndfsmAlgo";
import { alphabet, setAlphabet, transitionLabelInputValidator } from "../../../src/lib/ndfsm/ndfsmTransitionSymbols";
import { Importer } from "./importing/importer";
import { clearAutomaton, initFsmCanvas } from "../canvasUtil/fsmCanvas";
import { SerializedFA } from "@/lib/shared/types";
import { serializeFA } from "@/lib/shared/serializer/serializeFA";
import { circles } from "../Shapes/Circle";
import { arrows } from "../Shapes/Arrow";
import { setStartState, startState } from "../Shapes/EntryArrow";
import { deserializeFA } from "@/lib/shared/deserializer/deserializeFA";

let drawRef: (() => void) | null = null;

let pendingNDFSM: SerializedFA | null = null;

window.loadNDFSMIntoCanvas = function(data: SerializedFA){
  if(!drawRef){
    pendingNDFSM = data;
    return;
  }

  loadSerializedNDFSM(data);
}

window.exportNDFSM = function(){
  return serializeFA(
    alphabet,
    circles,
    arrows,
    startState,
  );
}

initFsmCanvas({
  automatonLabel: "NDFSM",
  canvasId: "NDFSMCanvas",
  runBtnId: "ndfsmRunBtn",
  alphabetUpdatedEventName: "ndfsmAlphabetUpdated",
  runAlgo: ndfsmAlgo,
  commitTransition,
  getAlphabet: () => alphabet,
  setAlphabet,
  getValidator: () => transitionLabelInputValidator,
  createImporter: (circs, arrs, data, draw) => new Importer(circs, arrs, data, draw),
  onCanvasReady: (draw) => {
    drawRef = draw;

    if(pendingNDFSM){
      loadSerializedNDFSM(pendingNDFSM);
      pendingNDFSM = null;
      draw();
    }
  }
});

function loadSerializedNDFSM(data: SerializedFA){
  const canvas = document.getElementById("NDFSMCanvas") as HTMLCanvasElement;

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

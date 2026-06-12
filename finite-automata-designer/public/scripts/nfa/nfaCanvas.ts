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
import { initFsmCanvas } from "../canvasUtil/fsmCanvas";

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
});

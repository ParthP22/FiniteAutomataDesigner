export {};

declare global {
  interface Window {
    /** Loads a serialized automaton object into the DFA canvas. */
    loadDFAIntoCanvas: (automaton: SerializedDFA) => void;

    /** Loads a serialized automaton object into the NFA canvas. */
    loadNFAIntoCanvas: (automaton: SerializedNFA) => void;
    
    /** Serializes the current DFA canvas state and returns it. */
    exportDFA: () => SerializedDFA;

    /** Serializes the current NFA canvas state and returns it. */
    exportNFA: () => SerializedNFA;
  }
}

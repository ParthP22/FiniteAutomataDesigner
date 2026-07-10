export {};

declare global {
  interface Window {
    /** Loads a serialized automaton object into the DFA canvas. */
    loadDFAIntoCanvas: (automaton: SerializedFA) => void;

    /** Loads a serialized automaton object into the NFA canvas. */
    loadNFAIntoCanvas: (automaton: SerializedFA) => void;

    /** Serializes the current DFA canvas state and returns it. */
    exportDFA: () => SerializedFA;

    /** Serializes the current NFA canvas state and returns it. */
    exportNFA: () => SerializedFA;

  }
}

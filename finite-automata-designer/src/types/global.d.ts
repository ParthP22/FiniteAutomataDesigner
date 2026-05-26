export {};

declare global {
  interface Window {
    /** Loads a serialized automaton object into the DFA canvas. */
    loadDFAIntoCanvas: (automaton: unknown) => void;
    /** Serializes the current DFA canvas state and returns it. */
    exportDFA: () => unknown;
  }
}

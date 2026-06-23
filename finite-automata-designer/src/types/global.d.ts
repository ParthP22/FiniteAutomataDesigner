export {};

declare global {
  interface Window {
    /** Loads a serialized automaton object into the FA canvas. */
    loadFAIntoCanvas: (automaton: SerializedFA) => void;

    /** Serializes the current DFA canvas state and returns it. */
    exportFA: () => SerializedFA;

  }
}

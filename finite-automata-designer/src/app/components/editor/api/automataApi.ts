import { SerializedFA } from "@/lib/shared/types";

export const automataApi = {
    DFA: {
        loadFAIntoCanvas: (data: SerializedFA) => window.loadDFAIntoCanvas(data),
        exportFA: () => window.exportDFA(),
    },
    NFA: {
        loadFAIntoCanvas: (data: SerializedFA) => window.loadNFAIntoCanvas(data),
        exportFA: () => window.exportNFA(),
    },
} as const;
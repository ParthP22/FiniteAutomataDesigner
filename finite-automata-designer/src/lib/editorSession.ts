import { EditorSession } from "@/types/editorSession";

export function getEditorSession(type: "DFSM" | "NDFSM") {
    const key = `${type.toLowerCase()}-session`;

    const stored = sessionStorage.getItem(key);

    if (!stored) {
        return null;
    }

    return JSON.parse(stored) as EditorSession;
}


export function setEditorSession(
    type: "DFSM" | "NDFSM",
    session: EditorSession
) {
    const key = `${type.toLowerCase()}-session`;

    sessionStorage.setItem(
        key,
        JSON.stringify(session)
    );
}


export function clearEditorSession(
    type: "DFSM" | "NDFSM"
) {
    const key = `${type.toLowerCase()}-session`;

    sessionStorage.removeItem(key);
}

// Clears both DFSM and NDFSM session entries. Call this on sign-out so the
// next person to use this tab doesn't get dropped into the previous user's
// last-opened project.
export function clearAllEditorSessions() {
    (["DFSM", "NDFSM"] as const).forEach(clearEditorSession);
}
// Client-side toast contract shared by the React components and the compiled
// canvas scripts. Deliberately framework-free: code bundled by rollup
// (public/scripts/**, src/lib/**) must import showToast from here — importing
// the ToastNotification component module instead would pull JSX into the
// canvas bundles, which rollup cannot parse.

// Name of the CustomEvent the toast host (AutomataEditor) listens for
export const SHOW_TOAST_EVENT = "showToast";

// Payload carried by the event; mirrors the ToastNotification props
export interface ShowToastDetail {
    message: string;
    duration?: number;
    color?: "green" | "red";
}

// Wrapper around the CustomEvent dispatch so callers don't have to build the
// event by hand. Omitted options fall back to the component defaults (2s, green).
//
//   showToast("Automaton saved!");
//   showToast("Save failed!", { color: "red", duration: 4000 });
export function showToast(message: string, options?: Omit<ShowToastDetail, "message">) {
    window.dispatchEvent(new CustomEvent<ShowToastDetail>(SHOW_TOAST_EVENT, {
        detail: { message, ...options },
    }));
}

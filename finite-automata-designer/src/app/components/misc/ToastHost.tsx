"use client";

import { useEffect, useState } from "react";
import ToastNotification, { SHOW_TOAST_EVENT, ShowToastDetail } from "./ToastNotification";

// Mounts the listener for showToast() requests and renders the active toast.
// A page needs exactly one host somewhere in its tree for toasts to appear.
// The incrementing id keys the toast so a repeat notification remounts it
// and restarts its auto-dismiss timer.
export default function ToastHost() {
    const [toast, setToast] = useState<(ShowToastDetail & { id: number }) | null>(null);

    useEffect(() => {
        const handler = (event: Event) => {
            const customEvent = event as CustomEvent<ShowToastDetail>;
            setToast(prev => ({ ...customEvent.detail, id: (prev?.id ?? 0) + 1 }));
        };

        window.addEventListener(SHOW_TOAST_EVENT, handler);

        return () => {
            window.removeEventListener(SHOW_TOAST_EVENT, handler);
        };
    }, []);

    if (!toast) return null;

    return (
        <ToastNotification
            key={toast.id}
            toastMsg={toast.message}
            duration={toast.duration}
            color={toast.color}
            onClose={() => setToast(null)}
        />
    );
}

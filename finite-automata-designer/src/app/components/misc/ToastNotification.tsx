"use client";

import { useEffect, useRef, useState } from "react";

interface ToastNotificationProp {
    toastMsg: string;
    // How long the toast stays on screen, in milliseconds
    duration?: number;
    // "green" for confirmations (default), "red" for errors
    color?: "green" | "red";
    onClose?: () => void;
}

const colorStyles = {
    green: { toast: "bg-[#9FE2BF]", button: "hover:bg-[#7BB094]" },
    red: { toast: "bg-[#E1A1A1]", button: "hover:bg-[#B07B7B]" },
} as const;

export default function ToastNotification({
    toastMsg,
    duration = 2000,
    color = "green",
    onClose,
}: ToastNotificationProp) {
    const [visible, setVisible] = useState(true);

    // Keep the latest onClose in a ref so a parent passing a new inline
    // arrow function on every render doesn't restart the timer below
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    });

    function dismiss() {
        setVisible(false);
        onCloseRef.current?.();
    }

    // Auto-dismiss after `duration` ms; the cleanup cancels the timer if
    // the toast unmounts (or duration changes) before it fires
    useEffect(() => {
        const timer = setTimeout(dismiss, duration);
        return () => clearTimeout(timer);
    }, [duration]);

    if (!visible) return null;

    return(
        <div
            className={`animate-toast-in ${colorStyles[color].toast} border rounded-lg fixed top-5 inset-x-0 z-50 mx-auto w-full max-w-md p-4 text-black text-center`}
        >
            {toastMsg}
        <button
            className={`absolute top-1 right-1 rounded px-2 ${colorStyles[color].button}`}
            onClick={dismiss}
            >
            X
        </button>
        </div>
    );
}

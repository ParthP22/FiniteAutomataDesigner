import { ReactNode } from "react";

interface ErrorMessageProps {
    title: string;
    message: string;
    action?: ReactNode;
}

// Full-screen error state. Purely presentational, so it can be rendered inline
// by a client component or used from a page/not-found file. An optional action
// (e.g. a button) is rendered below the message.
export default function ErrorMessage({ title, message, action }: ErrorMessageProps) {
    return (
        <main className="min-h-screen bg-blue-100 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                <h1 className="text-3xl font-bold text-black">{title}</h1>
                <p className="mt-4 text-gray-600">{message}</p>
                {action && (
                    <div className="mt-6 flex justify-center">{action}</div>
                )}
            </div>
        </main>
    );
}

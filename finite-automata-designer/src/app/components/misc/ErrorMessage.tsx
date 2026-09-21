interface ErrorMessageProps {
    title: string;
    message: string;
}

// Full-screen error state. Purely presentational, so it can be rendered inline
// by a client component or used from a page/not-found file.
export default function ErrorMessage({ title, message }: ErrorMessageProps) {
    return (
        <main className="min-h-screen bg-blue-100 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                <h1 className="text-3xl font-bold text-black">{title}</h1>
                <p className="mt-4 text-gray-600">{message}</p>
            </div>
        </main>
    );
}

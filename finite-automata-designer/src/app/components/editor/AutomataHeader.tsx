"use client";

interface AutomataHeaderProps{
    title: string;
    description?: string | null;
}


export default function AutomataHeader({title, description = null}: AutomataHeaderProps){
    return (
        <div>
            <h1 className="text-5xl font-bold text-center my-2 text-black ">
                <span className="drop-shadow-[0_0_1px_rgba(0,0,0,0.7)]">
                    {title}
                </span>
                <span className="h-8 bg-gradient-to-b from-white/30 via-white/10 to-transparent opacity-20 rounded pointer-events-none"></span>
            </h1>
            {description && (
                <p
                    className="
                        mt-3
                        max-w-3xl
                        mx-auto
                        px-4
                        text-lg
                        text-gray-600
                        break-words
                    "
                >
                    {description}
                </p>
            )}
        </div>

    );
}
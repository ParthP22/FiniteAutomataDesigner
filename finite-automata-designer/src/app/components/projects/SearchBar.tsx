"use client";


interface SearchBarProps{
    searchTerms: string;
    placeholderText?: string;
    onChange: (searchTerms: string) => void;
}

export default function SearchBar({
    searchTerms,
    placeholderText = "Search...",
    onChange,
}: SearchBarProps){
    return (
         <div className="relative w-full">

            <input
                type="text"
                value={searchTerms}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholderText}
                className="
                    w-full rounded-lg border border-slate-300
                    bg-white py-2 pl-10 pr-4
                    text-slate-900
                    placeholder:text-slate-400
                    focus:border-indigo-500
                    focus:outline-none
                    focus:ring-2 focus:ring-indigo-500
                "
            />
        </div>
    );
}
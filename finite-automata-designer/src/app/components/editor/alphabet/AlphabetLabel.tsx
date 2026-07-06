"use client";

interface AlphabetLabelProps{
    hasMultiCharAlphabet: boolean;
}

export default function AlphabetLabel({ hasMultiCharAlphabet }: AlphabetLabelProps){
    return (
        <>
            <div className="min-h-[3rem]">
                {hasMultiCharAlphabet && (
                    <div className="w-full rounded border border-red-300 bg-red-100 px-3 py-2">
                        <p className="text-sm text-red-700 font-semibold">
                            Multi-character element detected in alphabet. Please separate elements
                            in your input string with commas or spaces.
                        </p>
                    </div>
                )}
            </div>
            
            {/* Textbox for inputting the alphabet */}
            <label id="alphabetLabel" htmlFor="alphabet" className="block mb-1 text-gray-700 text-xl font-bold">
                Alphabet: {"{0,1}"}
            </label>
        </>
    );
}
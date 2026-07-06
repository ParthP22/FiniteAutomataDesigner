"use client";

export default function AlphabetInput(){

    return (
        <input
            id="alphabet"
            type="text"
            placeholder="Enter an alphabet..."
            className="w-full px-4 py-2 border border-gray-400 rounded shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            //onChange={(e) => setAlphabetDraft(e.target.value)}
            // Loose focus after you press enter
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.currentTarget.blur();
                    //setAlphabetInput(alphabetDraft.trim());
                }
            }}
        />
    );
}
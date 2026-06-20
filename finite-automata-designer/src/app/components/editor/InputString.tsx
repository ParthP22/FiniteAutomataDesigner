"use client";

export default function InputString(){
    
    return (
        <>
            <label 
                htmlFor="inputString" 
                className="block mb-1 text-gray-700 text-xl font-bold"
            >
                Input:
            </label>
            <input
                id="inputString"
                type="text"
                placeholder="Enter a string..."
                className="w-full px-4 py-2 border border-gray-400 rounded shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                // Loose focus after you press enter
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.currentTarget.blur();
                    }
                }}
            />
        </>
    );
}
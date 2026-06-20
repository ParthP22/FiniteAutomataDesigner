"use client";

export default function ImportTextArea(){

    return (
        <div id="importInputContainer" hidden className="text-center">
            <textarea 
                tabIndex={-1}
                id="input"
                className="w-full h-24 mt-2 border border-gray-400 rounded text-black bg-white select-none" 
                placeholder="Enter the input data that you exported EXCLUSIVELY from this FA designer goes here..."
            >
            </textarea>
            <div className="flex gap-4 justify-center text-black">
                <button 
                    id='hideInput' 
                    type="button" 
                    className="cursor-pointer text-center text-decoration underline"
                >
                    Hide Input
                </button>
                <button 
                    id='clearInput' 
                    type="button" 
                    className="cursor-pointer text-center text-decoration underline"
                >
                    Clear Input
                </button>
            </div>
        </div>
    );
}
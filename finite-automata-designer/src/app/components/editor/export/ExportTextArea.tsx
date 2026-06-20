"use client";

export default function ExportTextArea(){

    return (
        <div id="exportOutputContainer" hidden className="text-center">
            <textarea 
                disabled
                tabIndex={-1}
                id="output"
                className="w-full h-24 mt-2 border border-gray-400 rounded text-black bg-white select-none" 
                placeholder="Export will appear here..."
            >
            </textarea>
            <div className="flex gap-4 justify-center text-black">
                <button 
                    id='hideOutput' 
                    type="button" 
                    className="cursor-pointer text-center text-decoration underline"
                >
                    Hide Export Output
                </button>
                <button 
                    id='copyOutput' 
                    type="button" 
                    className="cursor-pointer text-center text-decoration underline"
                >
                    Copy Output
                </button>
            </div>
        </div>
    );
}
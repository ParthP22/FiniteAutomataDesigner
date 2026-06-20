"use client";

import { useRef, useState } from "react";
import { toggle_visiblity } from "../../../../public/scripts/canvasUtil/canvasUtil";

export default function ExportContainer(){

    const [exportOpen, setExportOpen] = useState(false);
    
    const exportMenuRef = useRef<HTMLDivElement>(null);
    
    return (
        <div className="flex gap-2">
            <p className="text-lg mt-5">Export as: </p> 
            <div className="relative inline-block text-left mt-5">
                {/* Exporting options parent selector*/}
                <button
                    id="exportMenuBtn"
                    type="button"
                    onClick={() => {
                        if (exportMenuRef.current) toggle_visiblity(exportMenuRef.current);
                        setExportOpen(prev => !prev);
                    }}
                    className="flex justify-center gap-x-1.5 rounded-md bg-gray-700 text-white px-2 py-1 text-md hover:bg-black transition"
                >
                    Export Options
                    <svg
                        className={`-mr-1 h-5 w-5 text-gray-400 h-4 w-4 transition-transform ${exportOpen ? "rotate-180" : ""}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.939l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.27a.75.75 0 01-.02-1.06z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
                
                {/* Export Menu options (SVG and LaTeX)*/}
                <div
                    ref={exportMenuRef}
                    id="exportMenu"
                    hidden
                    className="absolute mt-2 w-40 rounded-md bg-gray-700 shadow-lg z-20"
                >
                    <button
                        id="svgExportBtn"
                        type="button"
                        onClick={() => {
                            if (exportMenuRef.current) toggle_visiblity(exportMenuRef.current);
                            setExportOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-white hover:bg-gray-600"
                    >
                        SVG
                    </button>
                    <button
                        id="latexExportBtn"
                        type="button"
                        onClick={() => {
                            if (exportMenuRef.current) toggle_visiblity(exportMenuRef.current);
                            setExportOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-white hover:bg-gray-600"
                    >
                        LaTeX
                    </button>
                </div>
            </div>
        </div>
    );
}
"use client";

export type ProjectType = "all" | "DFA" | "NFA";

interface ProjectTypeFilterProps{
    filterType: ProjectType;
    onFilterChange: (filterType: ProjectType) => void;
}

export default function ProjectTypeFilter({
    filterType,
    onFilterChange,
}: ProjectTypeFilterProps){
    return (
        <div className="flex gap-2">
            
            <button
                onClick={() => onFilterChange("all")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    filterType === "all"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
                All
            </button>

            <button
                onClick={() => onFilterChange("DFA")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    filterType === "DFA"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
                DFA
            </button>

            <button
                onClick={() => onFilterChange("NFA")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    filterType === "NFA"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
                NFA
            </button>
        </div>
    );
}
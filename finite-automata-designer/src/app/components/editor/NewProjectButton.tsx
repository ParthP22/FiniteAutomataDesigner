"use client";

interface NewProjectButtonProps {
    handleNewProject: () => void;
}

export default function NewProjectButton({
    handleNewProject,
}: NewProjectButtonProps) {

    return (
        <button
            onClick={handleNewProject}
            className="bg-gray-700 text-white px-6 py-3 rounded hover:bg-black transition"
        >
            New Project
        </button>
    );
}
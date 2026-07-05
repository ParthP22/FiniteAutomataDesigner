"use client";

import { useEffect, useState } from "react";

interface SaveProjectModalProps{
    isOpen: boolean;
    initialName: string | null;
    initialDescription: string | null;
    onClose: () => void;
    onSave: (name: string, description: string) => Promise<void>;
}

export function SaveProjectModal({
    isOpen,
    initialName = null, 
    initialDescription = null,
    onClose,
    onSave,
}: SaveProjectModalProps){
    const [name, setName] = useState((initialName === null) ? "" : initialName);
    const [description, setDescription] = useState((initialDescription === null) ? "" : initialDescription);

    useEffect(() => {
        setName(initialName ?? "");
    }, [initialName]);

    useEffect(() => {
        setDescription(initialDescription ?? "");
    }, [initialDescription]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try{
            await onSave(name, description);
        }
        catch(error){
            console.error(error);
            alert("Failed to save changes: " + error);
        }
        finally{
            onClose();
        }

    };

    if(!isOpen){
        return null;
    }

    return (
        <div
            className="
                fixed inset-0 z-50
                flex items-center justify-center
                bg-black/50
                backdrop-blur-sm
                p-4
            "
        >
            <div
                className="
                    w-full max-w-lg
                    bg-white
                    rounded-2xl
                    shadow-2xl
                    p-6
                    animate-in fade-in zoom-in duration-200
                "
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Save Project
                    </h2>

                    <button
                        onClick={onClose}
                        className="
                            text-gray-500
                            hover:text-gray-800
                            text-2xl
                            transition
                        "
                    >
                        ×
                    </button>
                </div>

                <form className="space-y-5"
                    onSubmit={handleSubmit}
                >
                    <div>
                        <label
                            htmlFor="project-name"
                            className="
                                block
                                text-sm
                                font-semibold
                                text-gray-700
                                mb-2
                            "
                        >
                            Project Name
                        </label>

                        <input
                            id="project-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter project name..."
                            className="
                                w-full
                                rounded-lg
                                border
                                border-gray-300
                                px-4
                                py-3
                                text-gray-800
                                focus:outline-none
                                focus:ring-2
                                focus:ring-blue-500
                                focus:border-transparent
                            "
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="project-description"
                            className="
                                block
                                text-sm
                                font-semibold
                                text-gray-700
                                mb-2
                            "
                        >
                            Description
                        </label>

                        <textarea
                            id="project-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description..."
                            rows={4}
                            className="
                                w-full
                                rounded-lg
                                border
                                border-gray-300
                                px-4
                                py-3
                                text-gray-800
                                resize-none
                                focus:outline-none
                                focus:ring-2
                                focus:ring-blue-500
                                focus:border-transparent
                            "
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="
                                px-5 py-2.5
                                rounded-lg
                                border
                                border-gray-300
                                text-gray-700
                                hover:bg-gray-100
                                transition
                            "
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="
                                px-5 py-2.5
                                rounded-lg
                                bg-blue-600
                                text-white
                                font-semibold
                                hover:bg-blue-700
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                                transition
                            "
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
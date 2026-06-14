"use client";

import { useState } from "react";

interface SaveProjectModalProps{
    isOpen: boolean;
    initialName?: string;
    initialDescription?: string;
    onClose: () => void;
    onSave: (name: string, description: string) => Promise<void>;
}

export function SaveProjectModal({
    isOpen,
    initialName = "", 
    initialDescription = "",
    onClose,
    onSave,
}: SaveProjectModalProps){
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);

    if(!isOpen){
        return null;
    }

    return (
        <div>
            Save Project!!
            <div>
                Name: {name}
            </div>
            <div>
                Description: {description}
            </div>
            <button
                onClick={onClose}
            >
                Cancel
            </button>
        </div>
    );
}
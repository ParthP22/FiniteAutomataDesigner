"use client";

import { useState } from "react";

interface EditProjectModalProps{
    initialName: string;
    initialDescription: string | null;
    onEdit: () => Promise<void>;
    onCancel: () => void;
}

export function EditProjectModal({
    initialName,
    initialDescription,
    onEdit,
    onCancel,
}: EditProjectModalProps){
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription ?? "");
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div>
            Edit Project Modal!
        </div>
    );
}
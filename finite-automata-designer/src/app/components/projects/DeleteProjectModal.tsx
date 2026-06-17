"use client";

interface DeleteProjectModalProps{
    name: string;
    onDelete: () => Promise<void>;
    onCancel: () => void;
}

export function DeleteProjectModal({
    name,
    onDelete,
    onCancel,
}: DeleteProjectModalProps){
    return (
        <div>
            DeleteProject!
        </div>
    );
}
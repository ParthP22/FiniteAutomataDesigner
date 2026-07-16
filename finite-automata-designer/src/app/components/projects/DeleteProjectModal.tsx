"use client";

import { useState } from "react";
import { showToast } from "@/lib/toast";

interface DeleteProjectModalProps{
    name: string;
    onDelete: () => Promise<void>;
    onClose: () => void;
}

export function DeleteProjectModal({
    name,
    onDelete,
    onClose,
}: DeleteProjectModalProps){
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = async () => {
        try {
            setIsDeleting(true);
            await onDelete();
        } 
        catch(error){
            console.error(error);
            showToast("Failed to delete project: " + error, { color: "red", duration: 6000 });
        }
        finally {
            setIsDeleting(false);
        }
    };

    return (
        <div
            className="
                fixed inset-0 z-50
                flex items-center justify-center
                bg-black/50
            "
        >
            <div
                className="
                    bg-white
                    rounded-xl
                    shadow-xl
                    w-full
                    max-w-md
                    p-6
                    space-y-6
                "
            >
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Delete Project
                    </h2>

                    <p className="mt-2 text-gray-600">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">
                            {`"${name}"`}
                        </span>
                        ?
                    </p>

                    <p className="mt-2 text-sm text-red-600">
                        This action cannot be undone.
                    </p>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="
                            px-4 py-2
                            rounded-lg
                            border border-gray-300
                            text-gray-700
                            hover:bg-gray-100
                            disabled:opacity-50
                        "
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleDeleteClick}
                        disabled={isDeleting}
                        className="
                            px-4 py-2
                            rounded-lg
                            bg-red-600
                            text-white
                            hover:bg-red-700
                            disabled:opacity-50
                        "
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}
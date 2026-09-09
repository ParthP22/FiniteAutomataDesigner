"use client";

interface SaveActionsProps{
    onSave: () => void;
    onSaveAs?: () => void;
}

export default function SaveActions({
    onSave,
    onSaveAs,
}: SaveActionsProps){
    return (
        <>
            <button
                type="button"
                onClick={onSave}
                className="bg-gray-700 text-white px-6 py-3 rounded hover:bg-black transition"
            >
                Save
            </button>

            {onSaveAs && (
                <button
                    type="button"
                    onClick={onSaveAs}
                    className="bg-gray-700 text-white px-6 py-3 rounded hover:bg-black transition"
                >
                    Save As New Project
                </button>
            )}
        </>
    );
}
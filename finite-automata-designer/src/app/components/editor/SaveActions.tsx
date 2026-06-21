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
                className="flex-none px-8 py-3 bg-gray-700 text-white rounded hover:bg-black transition"
            >
                Save
            </button>

            {onSaveAs && (
                <button
                    type="button"
                    onClick={onSaveAs}
                    className="flex-none px-8 py-3 bg-gray-700 text-white rounded hover:bg-black transition"
                >
                    Save As New Project
                </button>
            )}
        </>
    );
}
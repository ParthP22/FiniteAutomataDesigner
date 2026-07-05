"use client";

import Link from "next/link";

interface ProjectCardProps {
    id: string;
    name: string;
    description: string | null;
    type: string;
    onEdit: () => void;
    onDelete: () => void;
}

export default function ProjectCard({
    id,
    name,
    description,
    type,
    onEdit,
    onDelete,
}: ProjectCardProps) {
    return (
        <div
            className="
                bg-white
                rounded-xl
                shadow-md
                hover:shadow-xl
                transition-all
                duration-200
                border
                border-gray-200
                p-6
                flex
                flex-col
                gap-4
                hover:-translate-y-1
            "
        >
            <Link
                href={`/${type.toLowerCase()}/${id}`}
                className="flex flex-col gap-4"
            >
                <div className="flex items-start justify-between">
                    <h2 className="text-2xl font-bold text-gray-800 break-words">
                        {name}
                    </h2>

                    <span
                        className={`
                            px-3 py-1 rounded-full text-sm font-semibold
                            ${
                                type === "DFA"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-purple-100 text-purple-700"
                            }
                        `}
                    >
                        {type}
                    </span>
                </div>

                <p className="text-gray-600 flex-grow">
                    {description || "No description provided."}
                </p>

                <div className="pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-400 truncate">
                        ID: {id}
                    </p>
                </div>
            </Link>

            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onEdit}
                    className="
                        flex-1
                        px-4
                        py-2
                        rounded-lg
                        bg-blue-500
                        text-white
                        hover:bg-red-600
                        transition
                    "
                >
                    Edit
                </button>

                <button
                    type="button"
                    onClick={onDelete}
                    className="
                        flex-1
                        px-4
                        py-2
                        rounded-lg
                        bg-red-500
                        text-white
                        hover:bg-red-600
                        transition
                    "
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
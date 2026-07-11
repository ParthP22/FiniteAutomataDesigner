"use client";

export type SortBy = "name" | "description" | "created_at" | "updated_at";
export type SortDirection = "asc" | "desc";

interface SortBarProps{
    sortBy: SortBy;
    sortDirection: SortDirection;
    onSortByChange: (sortBy: SortBy) => void;
    onDirectionChange: (direction: SortDirection) => void;
}

export default function SortBar({
    sortBy,
    sortDirection,
    onSortByChange,
    onDirectionChange,
} : SortBarProps){
    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">

                <select
                    id="sort-by"
                    value={sortBy}
                    onChange={(e) =>
                        onSortByChange(e.target.value as SortBy)
                    }
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-black focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="name">Name</option>
                    <option value="description">Description</option>
                    <option value="created_at">Date Created</option>
                    <option value="updated_at">Last Updated</option>
                </select>
            </div>

            <div className="flex items-center gap-2">

                <select
                    id="sort-direction"
                    value={sortDirection}
                    onChange={(e) =>
                        onDirectionChange(
                            e.target.value as SortDirection
                        )
                    }
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-black focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </div>
        </div>
    );
}
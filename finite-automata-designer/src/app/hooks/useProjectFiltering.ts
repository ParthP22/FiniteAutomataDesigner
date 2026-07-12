import { FiniteAutomaton } from "@/lib/shared/types";
import { SortBy, SortDirection } from "../components/projects/SortBar";
import { useMemo } from "react";

interface UseProjectFilteringProps{
    projects: FiniteAutomaton[];
    searchTerms: string;
    sortBy: SortBy;
    sortDirection: SortDirection;
}

export function useProjectFiltering({
    projects,
    searchTerms,
    sortBy,
    sortDirection,
}: UseProjectFilteringProps){
    return useMemo(() => {
        const filteredBySearch = projects.filter((project) => (
            project.name.trim().toLowerCase().includes(searchTerms.trim().toLowerCase()) ||
            project.description?.trim().toLowerCase().includes(searchTerms.trim().toLowerCase())
        ));

        const sortedProjects = filteredBySearch.sort((a,b) => {
            let comparison = 0;

            switch(sortBy){
            case "created_at":
                comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                break;
            case "updated_at":
                comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
                break;
            case "name":
                comparison = a.name.localeCompare(b.name);
                break;
            case "description":
                comparison = (a.description ?? "").localeCompare(b.description ?? "");
                break;
            }

            return (sortDirection === "asc") ? comparison : -comparison;
        });

        return sortedProjects;
    }, [
        projects,
        searchTerms,
        sortBy,
        sortDirection,
    ]);
}
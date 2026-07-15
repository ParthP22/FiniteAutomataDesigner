"use client";

import { FiniteAutomaton } from "@/lib/shared/types";
import ProjectCard from "./ProjectCard";

interface ProjectGridProps{
    totalProjects: number;
    visibleProjects: FiniteAutomaton[];
    onDelete: (project: FiniteAutomaton) => void;
    onEdit: (project: FiniteAutomaton) => void;
}

export default function ProjectGrid({
    totalProjects,
    visibleProjects,
    onDelete,
    onEdit,
}: ProjectGridProps){

    if(totalProjects === 0){
        return (
            <div className="bg-white rounded-xl shadow p-10 text-center">
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                    No Projects Yet
                </h2>

                <p className="text-gray-500">
                    Create your first automaton to get started.
                </p>
            </div>
        );
    }
    
    if(visibleProjects.length === 0){
        return (
            <div className="bg-white rounded-xl shadow p-10 text-center">
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                    No Projects Found
                </h2>

                <p className="text-gray-500">
                    Try a different search term.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleProjects.map((machine) => (
                <ProjectCard
                    key={machine.id}
                    id={machine.id}
                    name={machine.name}
                    description={machine.description}
                    type={machine.type}
                    onDelete={() => onDelete(machine)}
                    onEdit={() => onEdit(machine)}
                />
            ))}
        </div>
    );
}
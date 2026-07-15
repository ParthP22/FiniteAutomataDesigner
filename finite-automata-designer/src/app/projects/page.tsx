'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiniteAutomaton } from "@/lib/shared/types";
import { getUserAutomata } from "@/lib/automata/queries";
import { deleteAutomaton, editAutomaton } from "@/lib/automata/mutations";
import { DeleteProjectModal } from "../components/projects/DeleteProjectModal";
import { EditProjectModal } from "../components/projects/EditProjectModal";
import SearchBar from "../components/projects/SearchBar";
import SortBar, { SortBy, SortDirection } from "../components/projects/SortBar";
import { useProjectFiltering } from "../hooks/useProjectFiltering";
import ProjectTypeFilter, { ProjectType } from "../components/projects/ProjectTypeFilter";
import ProjectGrid from "../components/projects/ProjectGrid";

export default function AutomataPage() {
  const [machines, setMachines] = useState<FiniteAutomaton[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingProject, setDeletingProject] = useState<FiniteAutomaton | null>(null);
  const [editingProject, setEditingProject] = useState<FiniteAutomaton | null>(null);
  const [searchTerms, setSearchTerms] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortBy>("updated_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterType, setFilterType] = useState<ProjectType>("all");

  const router = useRouter();

  const visibleProjects = useProjectFiltering({
    projects: machines,
    searchTerms: searchTerms,
    sortBy: sortBy,
    sortDirection: sortDirection,
    filterType: filterType,
  });

  useEffect(() => {
    async function loadMachines() {
      try{
        const automata = await getUserAutomata();
        setMachines(automata || []);
      }
      catch(error){
        console.error(error);
        alert("Failed to retrieve user's projects: " + error);
      }
      finally{
        setLoading(false);
      }
      
    }

    loadMachines();
  }, [router]);

  const handleDelete = async (automatonId: string) => {
    try{
      await deleteAutomaton(automatonId);
      
      // Remove the deleted automaton from the machines array
      setMachines((prev) => prev.filter(project => project.id !== automatonId));

      alert("Deleted project successfully!");
    }
    catch(error){
      console.error(error);
      alert("Failed to delete selected project: " + error);
    }
    finally{
      setDeletingProject(null);
    }
  };

  const handleEdit = async (automatonId: string, name: string, description: string) => {
    try{

      const editedAutomaton = await editAutomaton(
        automatonId, 
        (name === "") ? null : name,
        (description === "") ? null : description,
      );
      
      setMachines((prev) => 
        prev.map((project) =>
          project.id === automatonId
            ? editedAutomaton
            : project
        )
      );

      alert("Saved edit successfully!");
    }
    catch(error){
      console.error(error);
      alert("Failed to save edit: " + error);
    }
    finally{
      setEditingProject(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  return (
        <main className="min-h-screen bg-blue-100 p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">
                        My Projects
                    </h1>
                </div>

                <div className="flex items-center justify-between gap-4 pb-4 mb-8 rounded-xl bg-white p-4 shadow">
                    <SearchBar
                        searchTerms={searchTerms}
                        placeholderText="Search projects..."
                        onChange={setSearchTerms}
                    />

                    <SortBar 
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onSortByChange={(sortBy: SortBy) => setSortBy(sortBy)}
                        onDirectionChange={(direction: SortDirection) => setSortDirection(direction)}
                    />

                    <ProjectTypeFilter
                      filterType={filterType}
                      onFilterChange={(filterType: ProjectType) => setFilterType(filterType)}
                    />
                </div>

                <ProjectGrid 
                  totalProjects={machines.length}
                  visibleProjects={visibleProjects}
                  onDelete={setDeletingProject}
                  onEdit={setEditingProject}
                />
            </div>

            { deletingProject &&
                <DeleteProjectModal 
                    name={deletingProject.name}
                    onDelete={() => handleDelete(deletingProject.id)}
                    onClose={() => setDeletingProject(null)}
                />
            }

            { editingProject &&
                <EditProjectModal 
                    id={editingProject.id}
                    initialName={editingProject.name}
                    initialDescription={editingProject.description}
                    onSave={handleEdit}
                    onClose={() => setEditingProject(null)}
                />
            }
        </main>
    );
}

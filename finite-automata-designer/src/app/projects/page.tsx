'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiniteAutomaton } from "@/lib/shared/types";
import { getUserAutomata } from "@/lib/automata/queries";
import ProjectCard from "../components/projects/ProjectCard";
import { deleteAutomaton, editAutomaton } from "@/lib/automata/mutations";
import { DeleteProjectModal } from "../components/projects/DeleteProjectModal";
import { EditProjectModal } from "../components/projects/EditProjectModal";

export default function AutomataPage() {
  const [machines, setMachines] = useState<FiniteAutomaton[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingProject, setDeletingProject] = useState<FiniteAutomaton | null>(null);
  const [editingProject, setEditingProject] = useState<FiniteAutomaton | null>(null);

  const router = useRouter();

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

      await editAutomaton(
        automatonId, 
        (name === "") ? null : name,
        (description === "") ? null : description,
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

                {machines.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-10 text-center">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                            No Projects Yet
                        </h2>

                        <p className="text-gray-500">
                            Create your first automaton to get started.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {machines.map((machine) => (
                            <ProjectCard
                                key={machine.id}
                                id={machine.id}
                                name={machine.name}
                                description={machine.description}
                                type={machine.type}
                                onDelete={() => setDeletingProject(machine)}
                                onEdit={() => setEditingProject(machine)}
                            />
                        ))}
                    </div>
                )}
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

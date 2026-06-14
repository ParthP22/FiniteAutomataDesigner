'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiniteAutomaton } from "@/lib/shared/types";
import { getUserAutomata } from "@/lib/automata/queries";

export default function AutomataPage() {
  const [machines, setMachines] = useState<FiniteAutomaton[]>([]);
  const [loading, setLoading] = useState(true);
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
    <main className="min-h-screen bg-blue-100 p-10 text-black">
      <h1 className="text-4xl font-bold mb-6 text-center">My Projects</h1>

      <div className="flex flex-col gap-4">
        {machines.map((machine) => (
          <Link
            key={machine.id}
            href={`/dfa?id=${machine.id}`}
            className="bg-gray-700 text-white px-4 py-3 rounded hover:bg-black transition"
          >
            Automaton {machine.id}
          </Link>
        ))}
      </div>
    </main>
  );
}

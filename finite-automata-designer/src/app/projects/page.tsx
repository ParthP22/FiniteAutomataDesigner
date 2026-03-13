'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AutomataPage() {
  const [machines, setMachines] = useState<any[]>([]);

  useEffect(() => {
    async function loadMachines() {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("finite_automata")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error(error);
        return;
      }

      setMachines(data || []);
    }

    loadMachines();
  }, []);

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
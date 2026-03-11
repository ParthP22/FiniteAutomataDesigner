import { createClient } from "./supabase/client";

export async function saveAutomaton(userId: string, serializedDFA: any){
    const supabase = createClient();

    const { data, error } = await supabase
        .from("finite_automata")
        .insert({
            user_id: userId,
            name: "Untitled DFA",
            type: "DFA",
            automaton: serializedDFA
        })
        .select()
        .single();

        if(error){
            throw error;
        }

        return data;
    
}
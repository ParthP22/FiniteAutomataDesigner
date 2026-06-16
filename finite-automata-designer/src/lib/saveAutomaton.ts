import { SerializedDFA } from "./dfa/types";
import { CreateAutomaton } from "./shared/types";
import { createClient } from "./supabase/client";

export async function saveAutomaton(serializedDFA: SerializedDFA, name: string | null, description: string | null){
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if(!user){
        alert("You must be logged in to save.");
        return;
    }

    const { data, error } = await supabase
        .from("finite_automata")
        .insert({
            user_id: user.id,
            name: name,
            description: description,
            type: "DFA",
            automaton: serializedDFA
        } as CreateAutomaton)
        .select()
        .single();

        if(error){
            throw error;
        }

        return data;
    
}
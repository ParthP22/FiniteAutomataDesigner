import { SerializedDFA } from "./dfa/types";
import { CreateAutomaton } from "./shared/types";
import { createClient } from "./supabase/client";

export async function saveAutomaton(userId: string, serializedDFA: SerializedDFA){
    const supabase = createClient();

    const { data, error } = await supabase
        .from("finite_automata")
        .insert({
            user_id: userId,
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
import { SerializedDFA } from "../dfa/types";
import { CreateAutomaton, FiniteAutomaton } from "../shared/types";
import { createClient } from "../supabase/client";

export async function saveAutomaton(serializedDFA: SerializedDFA, name: string | null, description: string | null){
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if(!user){
        throw new Error("User is not authenticated.");
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

    if(error || !data){
        throw error;
    }

    return data as FiniteAutomaton;
    
}

export async function updateAutomaton(automatonId: string, serializedDFA: SerializedDFA){
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if(!user){
        throw new Error("User is not authenticated.");
    }

    const { data, error } = await supabase
        .from("finite_automata")
        .update({
            automaton: serializedDFA,
        })
        .eq("id", automatonId);

    if(error){
        throw error;
    }

    return data;
}

export async function deleteAutomaton(automatonId: string){
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if(!user){
        throw new Error("User is not authenticated.");
    }

    const { data, error } = await supabase
        .from("finite_automata")
        .delete()
        .eq("id", automatonId);

    if(error){
        throw error;
    }

    return data;
}

export async function editAutomaton(automatonId: string, name: string | null, description: string | null){
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if(!user){
        throw new Error("User is not authenticated.");
    }

    const { data, error } = await supabase
        .from("finite_automata")
        .update({
            name: name,
            description: description,
        })
        .eq("id",automatonId);

    if(error){
        throw error;
    }

    return data;
}

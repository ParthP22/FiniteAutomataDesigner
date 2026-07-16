import { SerializedDFSM } from "../dfsm/types";
import { SerializedNDFSM } from "../ndfsm/types";
import { CreateAutomaton, FiniteAutomaton } from "../shared/types";
import { createClient } from "../supabase/client";

export async function saveAutomaton(
    serializedFA: SerializedDFSM | SerializedNDFSM, 
    name: string | null, 
    description: string | null, 
    type: "DFSM" | "NDFSM"
){
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
            type: type,
            automaton: serializedFA
        } as CreateAutomaton)
        .select()
        .single();

    if(error || !data){
        throw error;
    }

    return data as FiniteAutomaton;
    
}

export async function updateAutomaton(automatonId: string, serializedFA: SerializedDFSM | SerializedNDFSM){
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if(!user){
        throw new Error("User is not authenticated.");
    }

    const { data, error } = await supabase
        .from("finite_automata")
        .update({
            automaton: serializedFA,
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
        .eq("id",automatonId)
        .select()
        .single();

    if(error){
        throw error;
    }

    return data as FiniteAutomaton;
}

import { createClient } from "../supabase/client";
import { FiniteAutomaton } from "../shared/types";

export async function getUserAutomata(){
    const supabase = createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        throw new Error("User is not authenticated.");
    }

    const { data, error } = await supabase
        .from("finite_automata")
        .select("*")
        .eq("user_id", user.id);


    if (error) {
        console.error(error);
        throw new Error("There was an error fetching the user's projects.");
    }

    return data as FiniteAutomaton[];
    
}

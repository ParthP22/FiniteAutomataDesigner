// The alphabet defines every character that can be used in the DFA.
// For easier usage, it has been defined as a Set.
export var alphabet: Set<string> = new Set(["0","1"]);

// Since the alphabet is being imported, it cannot be reassigned
// directly. So, this is a setter method for it.
export function setAlphabet(newAlphabet: Set<string>){
    alphabet = newAlphabet;
}
import { Circle, circles } from "../../../public/scripts/Shapes/Circle";
import { nfaTransitionSymbols } from "./nfaTransitionSymbols";
import { Arrow, arrows } from "../../../public/scripts/Shapes/Arrow";
import { SelfArrow } from "../../../public/scripts/Shapes/SelfArrow";
import { startState } from "../../../public/scripts/Shapes/EntryArrow";
import { Queue } from "../data-structures/";
import { parseInputString } from "../input/InputStringLexer";

var pointers: Map<Circle | undefined,boolean> = new Map();



// Commits the transition to a given Arrow or SelfArrow after validating it.
export function commitTransition(lastEditedArrow: Arrow | SelfArrow | null){
    if(lastEditedArrow === null){
      return false;
    }
    if(lastEditedArrow.text === ""){
      lastEditedArrow.transition = new Set();
      console.log("Empty transition, accepted");
      return true;
    }

    // Leaving this here commented-out, for debugging purposes if the
    // need for it arises.
    // printTransitions();

    // Note: the code below will cover both the Arrow and the SelfArrow.
    // We won't need to split them into two separate cases.
    // This is because Arrow and SelfArrow both contain the startCircle
    // and endCircle attributes.
    
    // You don't want to check the transition for this current arrow
    // when iterating through all the arrows, so just empty it here.
    // If the transition is incorrect, then it'll remain empty.
    // If the transition is correct, then we'll reassign it to a new
    // value after all the checks.
    lastEditedArrow.transition = new Set();

    // The regex will remove any trailing/leading commas and whitespace
    const newTransitions = lastEditedArrow.text.replace(/^[,\s]+|[,\s]+$/g, "").split(",");

    // When you're typing the transition, the keydown listener checks if the
    // key pressed is in the alphabet. However, this is not enough.
    // This for-loop here will check if the entire transition itself is defined
    // in the alphabet.
    // For example, if the alphabet is {0,1}, but the transition is {00,01}, then
    // it should not work, since "00" and "01" are not in the alphabet.
    for(const newTransition of newTransitions){
      
      if(!nfaTransitionSymbols.has(newTransition)){
        lastEditedArrow.text = "";
        alert("\'" + newTransition + "\' has not been defined in the alphabet!");
        return false;
      }
    }

    
    // Update the transition with the new one
    lastEditedArrow.transition = new Set(newTransitions);
    lastEditedArrow.text = lastEditedArrow.transition.values().toArray().join(",");
    return true;
    
}

// This is a "completeness" check: do all the arrows have a valid transition?
export function completenessCheck(){
  
  // We iterate over every single state
  for(const arrow of arrows){
    if(arrow instanceof Arrow || arrow instanceof SelfArrow){
      if(arrow.transition.size === 0){
        alert("Arrow from " + arrow.startCircle.text + " to " + arrow.endCircle.text + " has no transition!");
        return false;
      }
    }
  }

  return true;
}

function epsilonTransitions(pointer: Circle){
  let queue: Queue<Circle> = new Queue();
  let visited: Map<Circle, boolean> = new Map();
  queue.offer(pointer);
  visited.set(pointer, true);


  while(!queue.isEmpty()){
    let current: Circle | undefined = queue.poll();
    let currentOutArrows: Set<Arrow | SelfArrow> = new Set();
    if(current !== undefined){
      currentOutArrows = current.outArrows;
    }
    for(const arrow of currentOutArrows){
      if(arrow.transition.has("\\epsilon") && !visited.has(arrow.endCircle)){
        visited.set(arrow.endCircle, true);
        queue.offer(arrow.endCircle);
        pointers.set(arrow.endCircle, true);}
    }
  }

} 

export function nfaAlgo(input: string){
  let acceptStateExists: boolean = false;
  for(const circle of circles){
    if(circle.isAccept){
      acceptStateExists = true;
      break;
    }
  }

  if(startState === null && !acceptStateExists){
    alert("Start state and accept states are both undefined!");
    return false;
  }
  else if(startState === null){
    alert("Start state undefined!");
    return false;
  }
  else if(!acceptStateExists){
    alert("Accept state undefined!");
    return false;
  }

  // First, we make sure the input string is legal. If it contains
    // characters not defined in the alphabet, then we return false immediately.
  for(const char of input){
    if(!nfaTransitionSymbols.has(char)){
      alert("Input contains \'" + char + "\', which is not in the alphabet");
      return false;
    }
  }

  pointers.clear();
  pointers.set(startState.pointsToCircle, false);

  epsilonTransitions(startState.pointsToCircle);

  // This "curr" variable will be used to traverse over the whole DFA
  //let curr: Circle = startState.pointsToCircle;

  // We check if the DFA has been defined correctly. If not, then return false.
//   if(!inputDeterminismCheck()){
//     return false;
//   }

  const parseResult = parseInputString(input, nfaTransitionSymbols);

  if (!parseResult.success) {
    alert(parseResult.error);
    return false;
  }
  const tokens = parseResult.tokens;

  if(!completenessCheck()){
    return false;
  }

  // We begin traversing the input string.
  for(const char of tokens){
    for(const pointer of pointers.keys()){
      if(pointer !== undefined){
        if(pointer.outArrows.size > 0){
          pointers.delete(pointer);
          continue;
        }
        // We go through every outgoing arrow for the 
            // current state.
        const currOutArrows = pointer.outArrows;
        //console.log("Char: " + char);
        for(const arrow of currOutArrows){
          //console.log("At: " + curr.text);
          //console.log("Checking transition: " + arrow.transition);

          // If the current character from the input string
          // is found in one of the transitions, then we 
          // use that transition to move to the next state.
    
          if(arrow.transition.has("ε")){//epsilon transition
            epsilonTransitions(pointer);
            continue;
          }
          if(arrow.transition.has(char)){
            //console.log("Taking transition: " + arrow.transition + " to node " + arrow.endCircle.text);
            pointers.set(arrow.endCircle, false);
            break;
          }
          pointers.delete(pointer);
        }
      }
    }
  }

  for(const pointer of pointers.keys()){
    if(pointer !== undefined){
      for(const arrow of pointer.outArrows){
        if (arrow.transition.has("\\epsilon")) {
          epsilonTransitions(pointer);
          continue;
        }
      }
    } 
  }

  for(const pointer of pointers.keys()){
    if(pointer !== undefined && pointer.isAccept){
      alert("The string, \"" + tokens.toString() + "\", was accepted!");
      //console.log("Accepted!");
      pointers.clear();
      return true;
    }
  }
  alert("The string, \"" + tokens.toString() + "\", was rejected!");
  //console.log("Rejected!");
  pointers.clear();
  return false;
}


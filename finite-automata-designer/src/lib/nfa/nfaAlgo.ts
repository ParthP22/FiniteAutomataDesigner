import { Circle, circles } from "../../../public/scripts/Shapes/Circle";
import { alphabet } from "../../../public/scripts/alphabet";
import { Arrow } from "../../../public/scripts/Shapes/Arrow";
import { SelfArrow } from "../../../public/scripts/Shapes/SelfArrow";
import { startState } from "../../../public/scripts/Shapes/EntryArrow";

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
    if(!alphabet.has(char)){
      alert("Input contains \'" + char + "\', which is not in the alphabet");
      return false;
    }
  }

  // This "curr" variable will be used to traverse over the whole DFA
  let curr: Circle = startState.pointsToCircle;

  // We check if the DFA has been defined correctly. If not, then return false.
//   if(!inputDeterminismCheck()){
//     return false;
//   }

  // We begin traversing the input string.
  for(const char of input){

    // We go through every outgoing arrow for the 
        // current state.
    const currOutArrows = curr.outArrows;
    //console.log("Char: " + char);
    for(const arrow of currOutArrows){
      //console.log("At: " + curr.text);
      //console.log("Checking transition: " + arrow.transition);

      // If the current character from the input string
            // is found in one of the transitions, then we 
            // use that transition to move to the next state.
      if(arrow.transition.has(char)){
        //console.log("Taking transition: " + arrow.transition + " to node " + arrow.endCircle.text);
        curr = arrow.endCircle;
        break;
      }
      else{
        //console.log("Not taking transition: " + arrow.transition + " to node " + arrow.endCircle.text);
      }
    }
  }

  //console.log("Finally at: " + curr.text);

  // If the final state that we arrived at is the end state,
    // that means the string was accepted.
  if(curr.isAccept){
    alert("The string, \"" + input + "\", was accepted!");
    //console.log("Accepted!");
    return true;
  }
  // Else, the final state we arrived at is not the end state,
    // which means the string was rejected.
  else{
    alert("The string, \"" + input + "\", was rejected!");
    //console.log("Rejected!");
    return false;
  }


}
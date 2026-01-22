import { Circle, circles } from "../../../public/scripts/Shapes/Circle";
import { alphabet } from "../../../public/scripts/alphabet";
import { Arrow } from "../../../public/scripts/Shapes/Arrow";
import { SelfArrow } from "../../../public/scripts/Shapes/SelfArrow";
import { startState } from "../../../public/scripts/Shapes/EntryArrow";
import Queue from "../queue/queue";

var pointers: Map<Circle | undefined,boolean> = new Map();

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
      if(arrow.transition.has("ε") && !visited.has(arrow.endCircle)){
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
    if(!alphabet.has(char)){
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

  // We begin traversing the input string.
  for(const char of input){
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
        if (arrow.transition.has("ε")){
          epsilonTransitions(pointer);
          continue;
        }
      }
    } 
  }

  for(const pointer of pointers.keys()){
    if(pointer !== undefined && pointer.isAccept){
      alert("The string, \"" + input + "\", was accepted!");
      //console.log("Accepted!");
      pointers.clear();
      return true;
    }
  }
  alert("The string, \"" + input + "\", was rejected!");
  //console.log("Rejected!");
  pointers.clear();
  return false;
}


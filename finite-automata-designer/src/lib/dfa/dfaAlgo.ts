import { Circle, circles } from "../../../public/scripts/circle";
import { alphabet } from "../../../public/scripts/alphabet";
import { Arrow } from "../../../public/scripts/arrow";
import { SelfArrow } from "../../../public/scripts/SelfArrow";
import { startState } from "../../../public/scripts/EntryArrow";
import { start } from "repl";

// I haven't figured out how to stop compiling the imports into JS, so here's a command
// to get rid of them once you cd into their directory lol:
// rm alphabet.js && rm arrow.js && rm circle.js && rm draw.js && rm EntryArrow.js && rm SelfArrow.js

// This is a "correctness" check: does the new transition coincide
// with other transitions going out from that state? If it does,
// then it fails determinism.
export function transitionDeterminismCheck(lastEditedArrow: Arrow | SelfArrow| null){
    if(lastEditedArrow == null){
      console.log("null");
      return;
    }
    else{
      alert("The transitionDeterminismCheck is running!!");
      console.log(lastEditedArrow.constructor.name);
    }

    // You don't want to check the transition for this current arrow
    // when iterating through all the arrows, so just empty it here.
    // If the transition is incorrect, then it'll remain empty.
    // If the transition is correct, then we'll reassign it to a new
    // value after all the checks.
    lastEditedArrow.transition = [];
    const newTransitions = lastEditedArrow.text.trim().split(",");
    console.log(newTransitions);
    
    
    if(lastEditedArrow instanceof Arrow){

      // Check the outArrows of the initial node
      const startCircOutArrows = lastEditedArrow.startCircle.outArrows;
      
      // You iterate through every arrow that goes outwards from this current node
      for(let arrow of startCircOutArrows){
        const oldTransitions = arrow.transition;

        // Then, you iterate through each of the old transitions for each arrow
        console.log("Old trans: " + oldTransitions);
        for(let oldTransition of oldTransitions){
          
          // Next, you iterate through each transition in the new
          // transition, and compare it against each transition
          // in the original transition for that arrow
          for(let newTransition of newTransitions){

            // If a transition already exists, then it fails determinism
            if(newTransition === oldTransition){
              lastEditedArrow.text = "";
              alert("This translation violates determinism since " + newTransition + " is already present for an outgoing arrow of the start node of this arrow");
              return false;
            }
          }
        }
      }

      // // Check the inArrows of the initial node
      // const startCircInArrows = lastEditedArrow.startCircle.inArrows;
      // for(let arrow of startCircInArrows){
      //   const oldTransitions = arrow.transition;
      //   for(let oldTransition of oldTransitions){
      //     for(let newTransition of newTransitions){
      //       if(newTransition === oldTransition){
      //         lastEditedArrow.text = "";
      //         alert("This translation violates determinism since " + newTransition + " is already present for an incoming arrow of the start node of this arrow");
      //         return false;
      //       }
      //     }
      //   }
      // }

      // Check the outArrows of the terminal node
      // const endCircOutArrows = lastEditedArrow.endCircle.outArrows;
      // for(let arrow of endCircOutArrows){
      //   const oldTransitions = arrow.transition;
      //   for(let oldTransition of oldTransitions){
      //     for(let newTransition of newTransitions){
      //       if(newTransition === oldTransition){
      //         lastEditedArrow.text = "";
      //         alert("This translation violates determinism since " + newTransition + " is already present for an outgoing arrow of the end node of this arrow");
      //         return false;
      //       }
      //     }
      //   }
      // }

      // Check the inArrows of the terminal node
      // const endCircInArrows = lastEditedArrow.endCircle.inArrows;
      // for(let arrow of endCircInArrows){
      //   const oldTransitions = arrow.transition;
      //   for(let oldTransition of oldTransitions){
      //     for(let newTransition of newTransitions){
      //       if(newTransition === oldTransition){
      //         lastEditedArrow.text = "";
      //         alert("This translation violates determinism since " + newTransition + " is already present for an incoming arrow of the end node of this arrow");
      //         return false;
      //       }
      //     }
      //   }
      // }


      // Check the loops for the start and end circles
      // const startCirc = lastEditedArrow.startCircle;
      // const endCirc = lastEditedArrow.endCircle;
      // if(startCirc.loop){
      //   const loopTransition = startCirc.loop.transition;
      //   for(let newTransition of newTransitions){
      //     if(newTransition in loopTransition){
      //       lastEditedArrow.text = "";
      //       alert("This translation violates determinism since " + newTransition + " is already present for the loop of the start node of this arrow");
      //       return false;
      //     }
      //   }
      // }
      // if(endCirc.loop){
      //   const loopTransition = endCirc.loop.transition;
      //   for(let newTransition of newTransitions){
      //     if(newTransition in loopTransition){
      //       lastEditedArrow.text = "";
      //       alert("This translation violates determinism since " + newTransition + " is already present for the loop of the end node of this arrow");
      //       return false;
      //     }
      //   }
      // }

      alert("This transition works!");
      lastEditedArrow.transition = newTransitions;
      return true;
    }
    else if(lastEditedArrow instanceof SelfArrow){
      const circOutArrows = lastEditedArrow.circle.outArrows;
      for(let arrow of circOutArrows){
        const oldTransitions = arrow.transition;
        console.log("Old trans: " + oldTransitions);
        for(let oldTransition of oldTransitions){
          for(let newTransition of newTransitions){
            if(newTransition === oldTransition){
              lastEditedArrow.text = "";
              alert("This translation violates determinism since " + newTransition + " is already present for an outgoing arrow of the node of this looped arrow");
              return false;
            }
          }
        }
      }

      // const circInArrows = lastEditedArrow.circle.inArrows;

      // for(let arrow of circInArrows){
      //   const oldTransitions = arrow.transition;
      //   for(let oldTransition of oldTransitions){
      //     for(let newTransition of newTransitions){
      //       if(newTransition === oldTransition){
      //         lastEditedArrow.text = "";
      //         alert("This translation violates determinism since " + newTransition + " is already present for an incoming arrow of the node of this looped arrow");
      //         return false;
      //       }
      //     }
      //   }
      // }

      alert("This transition works!");
      lastEditedArrow.transition = newTransitions;
      return true;
    }
    return true;
}

// This is a "completeness" check: were all characters of the
// alphabet used when building the DFA? This is processed
// every time we input a string.
export function inputDeterminismCheck(){
  
  // We iterate over every single state
  for(let node of circles){
    // We retrieve the outgoing arrows from the current state
    const outArrows = node.outArrows;
    for(let char of alphabet){
      // The "exists" variable will be used to track if
			// this specific character in the alphabet has been
			// used as a transition or not for this specific state
      var exists: boolean = false;

      // We iterate over all the outgoing arrows from the
			// current state
      for(let arrow of outArrows){

        // Then, for each arrow, we iterate over every
				// transition for it.
        for(let transition of arrow.transition){

          // If the current character in the alphabet
					// does exist as a transition for this current
					// state, then exists = true and we break out
					// of this loop.
          if (char === transition){
            exists = true;
            break;
          }

          // If the transition does not exist in the alphabet,
					// then immediately return false, since it violates
					// determinism.
          if(!alphabet.has(transition)){
            alert("Transition " + transition + " for state " + node.text + " has not been defined in the alphabet");
            console.log("The transition in question: " + arrow.transition);
            return false;
          }
        }
      }

      // If we iterated over all the transitions for all the outgoing
			// arrows of this state, and the current character in the alphabet
			// was not found to be a transition at all, then it fails determinism
      if(!exists){
        alert(char + " has not been implemented for this state: " + node.text + "; not all characters from alphabet were used");
        console.log("The transitions:");
        for(let arrow of node.outArrows){
            console.log(arrow.transition);
          
        }
        
        return false;
      }
    }
  }
  return true;
}

export function dfaAlgo(input: string){
  var acceptStateExists: boolean = false;
  for(let circle of circles){
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
  for(let char of input){
    if(!alphabet.has(char)){
      alert("Input contains \'" + char + "\', which is not in the alphabet");
      return false;
    }
  }

  // This "curr" variable will be used to traverse over the whole DFA
  var curr: Circle = startState.pointsToCircle;

  // We check if the DFA has been defined correctly. If not, then return false.
  if(!inputDeterminismCheck()){
    return false;
  }

  // We begin traversing the input string.
  for(let char of input){

    // We go through every outgoing arrow for the 
		// current state.
    const currOutArrows = curr.outArrows;
    console.log("Char: " + char);
    for(let arrow of currOutArrows){
      console.log("At: " + curr.text);
      console.log("Transition: " + arrow.transition);

      // If the current character from the input string
			// is found in one of the transitions, then we 
			// use that transition to move to the next state.
      if(char in arrow.transition){
        console.log("Taking transition: " + arrow.transition);
        curr = arrow.endCircle;
        break;
      }
    }
  }

  console.log("At: " + curr.text);

  // If the final state that we arrived at is the end state,
	// that means the string was accepted.
  if(curr.isAccept){
    alert("The string was accepted!");
    console.log("Accepted!");
    return true;
  }
  // Else, the final state we arrived at is not the end state,
	// which means the string was rejected.
  else{
    alert("The string was rejected!");
    console.log("Rejected!");
  }


}

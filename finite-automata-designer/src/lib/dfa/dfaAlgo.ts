import { Circle, circles } from "../../../public/scripts/circle";
import { alphabet } from "../../../public/scripts/alphabet";
import { Arrow } from "../../../public/scripts/arrow";
import { SelfArrow } from "../../../public/scripts/SelfArrow";

// I haven't figured out how to stop compiling the imports into JS, so here's a command
// to get rid of them once you cd into their directory lol:
// rm alphabet.js && rm arrow.js && rm circle.js && rm draw.js && rm EntryArrow.js && rm SelfArrow.js

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
      for(let arrow of startCircOutArrows){
        const oldTransitions = arrow.transition;
        console.log("Old trans: " + oldTransitions);
        for(let oldTransition of oldTransitions){
          for(let newTransition of newTransitions){
            if(newTransition === oldTransition){
              lastEditedArrow.text = "";
              alert("This translation violates determinism since " + newTransition + " is already present for an outgoing arrow of the start node of this arrow");
              return false;
            }
          }
        }
      }

      // Check the inArrows of the initial node
      const startCircInArrows = lastEditedArrow.startCircle.inArrows;
      for(let arrow of startCircInArrows){
        const oldTransitions = arrow.transition;
        for(let oldTransition of oldTransitions){
          for(let newTransition of newTransitions){
            if(newTransition === oldTransition){
              lastEditedArrow.text = "";
              alert("This translation violates determinism since " + newTransition + " is already present for an incoming arrow of the start node of this arrow");
              return false;
            }
          }
        }
      }

      // Check the outArrows of the terminal node
      const endCircOutArrows = lastEditedArrow.endCircle.outArrows;
      for(let arrow of endCircOutArrows){
        const oldTransitions = arrow.transition;
        for(let oldTransition of oldTransitions){
          for(let newTransition of newTransitions){
            if(newTransition === oldTransition){
              lastEditedArrow.text = "";
              alert("This translation violates determinism since " + newTransition + " is already present for an outgoing arrow of the end node of this arrow");
              return false;
            }
          }
        }
      }

      // Check the inArrows of the terminal node
      const endCircInArrows = lastEditedArrow.endCircle.inArrows;
      for(let arrow of endCircInArrows){
        const oldTransitions = arrow.transition;
        for(let oldTransition of oldTransitions){
          for(let newTransition of newTransitions){
            if(newTransition === oldTransition){
              lastEditedArrow.text = "";
              alert("This translation violates determinism since " + newTransition + " is already present for an incoming arrow of the end node of this arrow");
              return false;
            }
          }
        }
      }


      // Check the loops for the start and end circles
      const startCirc = lastEditedArrow.startCircle;
      const endCirc = lastEditedArrow.endCircle;
      if(startCirc.loop){
        const loopTransition = startCirc.loop.transition;
        for(let newTransition of newTransitions){
          if(newTransition in loopTransition){
            lastEditedArrow.text = "";
            alert("This translation violates determinism since " + newTransition + " is already present for the loop of the start node of this arrow");
            return false;
          }
        }
      }
      if(endCirc.loop){
        const loopTransition = endCirc.loop.transition;
        for(let newTransition of newTransitions){
          if(newTransition in loopTransition){
            lastEditedArrow.text = "";
            alert("This translation violates determinism since " + newTransition + " is already present for the loop of the end node of this arrow");
            return false;
          }
        }
      }

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

      const circInArrows = lastEditedArrow.circle.inArrows;

      for(let arrow of circInArrows){
        const oldTransitions = arrow.transition;
        for(let oldTransition of oldTransitions){
          for(let newTransition of newTransitions){
            if(newTransition === oldTransition){
              lastEditedArrow.text = "";
              alert("This translation violates determinism since " + newTransition + " is already present for an incoming arrow of the node of this looped arrow");
              return false;
            }
          }
        }
      }
      alert("This transition works!");
      lastEditedArrow.transition = newTransitions;
      return true;
    }
    return true;
}

export function inputDeterminismCheck(input: string){
  for(let char of input){
    if(!(char in alphabet)){
      alert("Input contains " + char + ", which is not in the alphabet!");
      return false;
    }
  }

  for(let node of circles){
    const outArrows = node.outArrows;
    for(let char of alphabet){
      var exists: boolean = false;
      for(let arrow of outArrows){
        for(let transition of arrow.transition){
          if (char === transition){
            exists = true;
            break;
          }
          if(!(transition in alphabet)){
            alert("Transition " + transition + "for state " + node + " has not been defined in the alphabet");
            return false;
          }
        }
      }
      if(!exists){
        alert(char + " has not been implemented for this state: " + node + "; not all characters from alphabet were used");
        return false;
      }
    }
  }
  return true;
}
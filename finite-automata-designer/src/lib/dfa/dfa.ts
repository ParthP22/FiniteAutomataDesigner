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
    const newTransitions = lastEditedArrow.text.trim().split(",");
    
    // (from Parth): I just realized a trick for this. I was thinking about checking all the inArrows
    // and outArrows of both the startCircle and endCircle, but I'm just going to be checking the
    // outArrows of the endCircle and the inArrows of the startCircle. This way, every single inArrow
    // for the endCircle and every single outArrow of the startCircle will be checked by this function.
    // I can't come up with a better explanation right now, but if I come up with one later, I will
    // jot it down here.
    if(lastEditedArrow instanceof Arrow){
      const outArrows = lastEditedArrow.endCircle.outArrows;
      for(let arrow of outArrows){
        const oldTransitions = arrow.transition;
        for(let oldTransition of oldTransitions){
          for(let newTransition of newTransitions){
            if(newTransition === oldTransition){
              alert("This translation violates determinism since " + newTransition + " is already present for this terminal node of this arrow");
              return false;
            }
          }
        }
      }

      const inArrows = lastEditedArrow.startCircle.inArrows;

      for(let arrow of inArrows){
        const oldTransitions = arrow.transition;
        for(let oldTransition of oldTransitions){
          for(let newTransition of newTransitions){
            if(newTransition === oldTransition){
              alert("This translation violates determinism since " + newTransition + " is already present for this start node of this arrow");
              return false;
            }
          }
        }
      }
      alert("This transition works!");
      return true;

      // lastEditedArrow.startCircle.outArrows.forEach((arrow: Arrow) => {
      //     const oldTransition = arrow.transition;
      //     oldTransition.forEach((oldTransition: string) => {
      //         transition.forEach((newTransition: string) => {
      //             if(newTransition === oldTransition){
      //                 return false;
      //             }
      //         });
      //     });
      // });
    }
    // else if(lastEditedArrow instanceof SelfArrow){

    // }
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
import { Circle, circles } from "../../../public/scripts/circle";
import { alphabet } from "../../../public/scripts/dfaCanvas";
import { Arrow } from "../../../public/scripts/arrow";
import { SelfArrow } from "../../../public/scripts/SelfArrow";

function transitionDeterminismCheck(circle: Circle, newTransition: string){
    const transition = newTransition.trim().split(",");

    circle.outArrows.forEach((arrow: Arrow) => {
        const oldTransition = arrow.transition;
        oldTransition.forEach((oldTransition: string) => {
            transition.forEach((newTransition: string) => {
                if(newTransition === oldTransition){
                    return false;
                }
            });
        });
    });
    return true;
}

function inputDeterminismCheck(input: string){
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
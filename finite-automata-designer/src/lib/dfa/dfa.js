import { circles } from "../../../public/scripts/circle";
import { alphabet } from "../../../public/scripts/alphabet";
export function transitionDeterminismCheck(newTransition) {
    if (newTransition === null) {
        return;
    }
    const transition = newTransition.text.trim().split(",");
    alert("The transitionDeterminismCheck is running!!");
    // circle.outArrows.forEach((arrow: Arrow) => {
    //     const oldTransition = arrow.transition;
    //     oldTransition.forEach((oldTransition: string) => {
    //         transition.forEach((newTransition: string) => {
    //             if(newTransition === oldTransition){
    //                 return false;
    //             }
    //         });
    //     });
    // });
    return true;
}
export function inputDeterminismCheck(input) {
    for (let char of input) {
        if (!(char in alphabet)) {
            alert("Input contains " + char + ", which is not in the alphabet!");
            return false;
        }
    }
    for (let node of circles) {
        const outArrows = node.outArrows;
        for (let char of alphabet) {
            var exists = false;
            for (let arrow of outArrows) {
                for (let transition of arrow.transition) {
                    if (char === transition) {
                        exists = true;
                        break;
                    }
                    if (!(transition in alphabet)) {
                        alert("Transition " + transition + "for state " + node + " has not been defined in the alphabet");
                        return false;
                    }
                }
            }
            if (!exists) {
                alert(char + " has not been implemented for this state: " + node + "; not all characters from alphabet were used");
                return false;
            }
        }
    }
    return true;
}

// import { transitionDeterminismCheck } from "../../src/lib/dfa/dfa"

// Command to compile this file into JS
// npm run build:canvas

import {Circle, circles} from "./circle";
import {Arrow, arrows} from "./arrow";
import {SelfArrow} from "./SelfArrow";
import {EntryArrow} from "./EntryArrow";
import {TemporaryArrow} from "./TemporaryArrow";
import { snapToPadding, selectedObj as selectedObject } from "./draw";

// Cannot assign the import itself, so I'm setting it as a new variable here
var selectedObj = selectedObject;

var highlight = 'blue';
var base = 'black';
var dragging = false;
var shiftPressed = false;
var startClick: {x: number, y: number} | null = null;
var tempArrow: TemporaryArrow | Arrow | SelfArrow | EntryArrow | null = null;

export var alphabet: string[] = ["0","1"];

// function transitionDeterminismCheck(circle: Circle, newTransition: string){
//     const transition = newTransition.trim().split(",");

//     circle.outArrows.forEach((arrow: Arrow) => {
//         const oldTransition = arrow.transition;
//         oldTransition.forEach((oldTransition: string) => {
//             transition.forEach((newTransition: string) => {
//                 if(newTransition === oldTransition){
//                     return false;
//                 }
//             });
//         });
//     });
//     return true;
// }

// function inputDeterminismCheck(input: string){
//   for(let char of input){
//     if(!(char in alphabet)){
//       alert("Input contains " + char + ", which is not in the alphabet!");
//       return false;
//     }
//   }

//   for(let node of circles){
//     const outArrows = node.outArrows;
//     for(let char of alphabet){
//       var exists: boolean = false;
//       for(let arrow of outArrows){
//         for(let transition of arrow.transition){
//           if (char === transition){
//             exists = true;
//             break;
//           }
//           if(!(transition in alphabet)){
//             alert("Transition " + transition + "for state " + node + " has not been defined in the alphabet");
//             return false;
//           }
//         }
//       }
//       if(!exists){
//         alert(char + " has not been implemented for this state: " + node + "; not all characters from alphabet were used");
//         return false;
//       }
//     }
//   }
//   return true;
// }

function setupDfaCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    // ctx?.translate(0.5, 0.5);

    for (var circle = 0; circle < circles.length; circle++) {
      ctx.lineWidth= 1;
      ctx.fillStyle = ctx.strokeStyle = (circles[circle] == selectedObj) ? highlight : base;
      circles[circle].draw(ctx);
    }

    for (var arrow = 0; arrow < arrows.length; arrow++) {
      ctx.lineWidth = 1;
      ctx.fillStyle = ctx.strokeStyle = (arrows[arrow] == selectedObj) ? highlight : base;
      arrows[arrow].draw(ctx);
    }

    if (tempArrow != null) {
      ctx.lineWidth = 1;
      ctx.fillStyle = ctx.strokeStyle = base;
      tempArrow.draw(ctx);
    }
  }

  /* Event Handlers */
  canvas.addEventListener('mousedown', (event: MouseEvent) => {
    var mouse = getMousePos(event)
    selectedObj = mouseCollision(mouse.x, mouse.y);
    dragging = false;
    startClick = mouse;

    if (selectedObj != null) {
      if (shiftPressed && selectedObj instanceof Circle) {
        // Draw a SelfArrow to the selected circle
        tempArrow = new SelfArrow(selectedObj, mouse);
      } else {
        dragging = true;
        if (selectedObj instanceof Circle || selectedObj instanceof SelfArrow) {
          selectedObj.setMouseStart(mouse.x, mouse.y);
        }
      }
    } else if (shiftPressed) {
      // Cosmetic arrow logic for interactive response
      tempArrow = new TemporaryArrow(mouse, mouse);
    }

    draw();
  });


  canvas.addEventListener('dblclick', (event) => {
    var mouse = getMousePos(event);
    selectedObj = mouseCollision(mouse.x, mouse.y);

    if (selectedObj == null) {
      selectedObj = new Circle(mouse.x, mouse.y);
      if (selectedObj instanceof Circle) {
        circles.push(selectedObj);
        draw();
      }
    } else if (selectedObj instanceof Circle) {
      selectedObj.isAccept = !selectedObj.isAccept;
      draw();
    }
  });

  canvas.addEventListener('mousemove', (event) => {
    var mouse = getMousePos(event);

    if (tempArrow != null) {
      var targetCircle = mouseCollision(mouse.x, mouse.y);
      if (!(targetCircle instanceof Circle)) {
        targetCircle = null;
      }

      if (selectedObj == null && startClick != null) {
        if (targetCircle != null && targetCircle instanceof Circle) {
          tempArrow = new EntryArrow(targetCircle, startClick);
        } else {
          tempArrow = new TemporaryArrow(startClick, mouse);
        }
      } else {
        if (targetCircle == selectedObj && targetCircle instanceof Circle) {
          tempArrow = new SelfArrow(targetCircle, mouse);
        } else if (targetCircle != null && selectedObj instanceof Circle && targetCircle instanceof Circle) {
          tempArrow = new Arrow(selectedObj, targetCircle);
        } else if (selectedObj instanceof Circle) {
          tempArrow = new TemporaryArrow(selectedObj.closestPointOnCircle(mouse.x, mouse.y), mouse);
        }
      }
      draw();
    }

    if (dragging) {
      selectedObj?.setAnchorPoint(mouse.x, mouse.y);
      if (selectedObj instanceof Circle) {
        snapAlignCircle(selectedObj);
      }
      draw();
    }
  });

  canvas.addEventListener('mouseup', (event) =>{
    dragging = false;

    if (tempArrow != null) {
      if(!(tempArrow instanceof TemporaryArrow)) { 
        // When adding the tempArrow to the arrows array, 
        // Check if a self arrow points to the selected circle already
        
        if (tempArrow instanceof SelfArrow) {
          var hasSelfArrow = false
          for (var i = 0; i < arrows.length; i++) {
            var arrow = arrows[i];
            if (arrow instanceof SelfArrow) {
              if (arrow.circle == selectedObj) {
                hasSelfArrow = true;
                break;
              }
            }
          }
          if (!hasSelfArrow) {
            selectedObj = tempArrow;
            arrows.push(tempArrow);
          }
        } else if (tempArrow instanceof EntryArrow) {
          var hasEntryArrow = false;
          for (var i = 0; i < arrows.length; i++) {
            if (arrows[i] instanceof EntryArrow) {
              hasEntryArrow = true;
              break;
            }
          }
          if (!hasEntryArrow) {
            selectedObj = tempArrow;
            arrows.push(tempArrow);
          }
        } else {
          selectedObj = tempArrow;
          arrows.push(tempArrow);
        }
        
      }
      tempArrow = null;
    }

    draw();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Shift') {
      shiftPressed = true;
    } 

    if (selectedObj != null && 'text' in selectedObj) {
      if(event.key === 'Backspace') {
        selectedObj.text = selectedObj.text.substring(0, selectedObj.text.length - 1);
        draw();
      } else if (event.key === 'Delete') {
        for (var circ = 0; circ < circles.length; circ++) {
          if (circles[circ] == selectedObj) {
            circles.splice(circ--, 1);
          }
        }
        for (var i = 0; i < arrows.length; i++) {
          const arrow = arrows[i];
          if (arrow == selectedObj) {
            arrows.splice(i--, 1);
          }
          if (arrow instanceof SelfArrow) {
            if (arrow.circle == selectedObj){
              arrows.splice(i--, 1);
            }
          }
          if (arrow instanceof EntryArrow) {
            if (arrow.pointsToCircle == selectedObj) {
              arrows.splice(i--, 1);
            }
          }
          if (arrow instanceof Arrow) {
            if (arrow.startCircle == selectedObj || arrow.endCircle == selectedObj) {
              arrows.splice(i--, 1)
            }
          } 
        }
        draw();
      } else {
        if (event.key.length === 1) {
          selectedObj.text += event.key;
          draw()
        }
      }
    }
    
  });

  document.addEventListener('keyup', (event) => {
    if (event.key === 'Shift') {
      shiftPressed = false;
    }
  })

  /* Helper Functions*/

  // Align the input circle to any circle in the array if x or y absolute is less than padding
  function snapAlignCircle(circle: Circle) {
    for(var circ = 0; circ < circles.length; circ++) {
      if(circles[circ] == circle) continue;

      if(Math.abs(circle.x - circles[circ].x) < snapToPadding) {
        circle.x = circles[circ].x;
      }

      if(Math.abs(circle.y - circles[circ].y) < snapToPadding) {
        circle.y = circles[circ].y;
      }
    }
  }

  // Get the current mouse position inside the canvas
  const getMousePos = (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  // Get the collided object at the point x, y
  function mouseCollision(x: number, y: number) {
    for(var circ = 0; circ < circles.length; circ++) {
      if(circles[circ].containsPoint(x, y)) {
        return circles[circ];
      }
    }
    for(var arrow = 0; arrow < arrows.length; arrow++) {
      if (arrows[arrow].containsPoint(x, y)) {
        return arrows[arrow];
      }
    }

    return null;
  }
}

/* -----------------------------------------------------------
 * Attach automatically when DOM is ready.
 * --------------------------------------------------------- */
function attachWhenReady() {
  const run = () => {
    const canvas = document.getElementById('DFACanvas') as HTMLCanvasElement | null;
    if (canvas)  {
      setupDfaCanvas(canvas)
    };
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run(); // DOM is already ready
  }
}

attachWhenReady();

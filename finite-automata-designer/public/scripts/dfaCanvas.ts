// import { transitionDeterminismCheck } from "../../src/lib/dfa/dfa"

// Command to compile this file into JS
// npm run build:canvas

import {Circle, circles} from "./circle";
import {Arrow, arrows} from "./arrow";
import {SelfArrow} from "./SelfArrow";
import {EntryArrow,startState, setStartState} from "./EntryArrow";
import {TemporaryArrow} from "./TemporaryArrow";
import { snapToPadding} from "./draw";
import { dfaAlgo, transitionDeterminismCheck } from "../../src/lib/dfa/dfaAlgo";
import { alphabet, setAlphabet } from "./alphabet";


var lastEditedObject: Arrow | SelfArrow | Circle | null = null;

var selectedObj: Circle | EntryArrow | Arrow | SelfArrow | null = null;
var hightlightSelected = 'blue';
var highlightTyping = 'red'
var base = 'black';
var dragging = false;
var shiftPressed = false;
var typingMode = false;
var startClick: {x: number, y: number} | null = null;
var tempArrow: TemporaryArrow | Arrow | SelfArrow | EntryArrow | null = null;

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
                                                                            // If we're in typing mode, use the red highlight, else blue highlight
      ctx.fillStyle = ctx.strokeStyle = (circles[circle] == selectedObj) ? ((typingMode) ? highlightTyping : hightlightSelected) : base;
      circles[circle].draw(ctx);
    }

    for (var arrow = 0; arrow < arrows.length; arrow++) {
      ctx.lineWidth = 1;
                                                                            // If we're in typing mode, use the red highlight, else blue highlight
      ctx.fillStyle = ctx.strokeStyle = (arrows[arrow] == selectedObj) ? ((typingMode) ? highlightTyping : hightlightSelected) : base;
      arrows[arrow].draw(ctx);
    }

    if(startState){
      ctx.lineWidth = 1;
      ctx.fillStyle = ctx.strokeStyle = (startState == selectedObj) ? hightlightSelected : base;
      startState.draw(ctx);
    }

    if (tempArrow != null) {
      ctx.lineWidth = 1;
      ctx.fillStyle = ctx.strokeStyle = base;
      tempArrow.draw(ctx);
    }
  }

  /* Event Handlers */
  canvas.addEventListener('mousedown', (event: MouseEvent) => {
    event.preventDefault();
    
    var mouse = getMousePos(event)
    selectedObj = mouseCollision(mouse.x, mouse.y);
    dragging = false;
    startClick = mouse;

    switch(event.button){
      case 0:
        if(typingMode){
          // If we left-click and the previous edited object was an Arrow or SelfArrow, run
          // the transition check since it means the transition has been submitted
          if(lastEditedObject instanceof Arrow || lastEditedObject instanceof SelfArrow){
            //alert("transDetCheck 1 running!!");
            transitionDeterminismCheck(lastEditedObject);
          }
          typingMode = false;
        }
        break;
      case 2:
        if(selectedObj !== null && (
          selectedObj instanceof Arrow || 
          selectedObj instanceof SelfArrow ||
          selectedObj instanceof Circle)){
            
            // In the event that the user right clicks on something else that is NOT the previously edited
            // arrow, then it will run the transitionDeterminismCheck and set typingMode to false, because
            // it would indicate that the user has submitted
            if(typingMode && (lastEditedObject instanceof Arrow || lastEditedObject instanceof SelfArrow) && selectedObj !== lastEditedObject){
              //alert("transDetCheck 2 running!!");
              transitionDeterminismCheck(lastEditedObject);
              typingMode = false;
            }
            
            // Update the previously edited object
            lastEditedObject = selectedObj;

            // Set typing mode to true, since the object that was currently right-clicked on is an Arrow
            // or SelfArrow or Circle, which means it can be typed on
            typingMode = true;
        }
        // If the selected object is null (meaning nothing is selected) or if the currently selected object is
        // not an Arrow or SelfArrow or Circle, then enter this else-block
        else{
          // If it is currently on typing mode and the previously edited object was an Arrow or SelfArrow,
          // we will run the transitionDeterminismCheck, since right-clicking anything but an Arrow, SelfArrow,
          // or Circle means the user has submitted their transition
          if(typingMode && (lastEditedObject instanceof Arrow || lastEditedObject instanceof SelfArrow)){
              //alert("transDetCheck 3 running!!");
              transitionDeterminismCheck(lastEditedObject);
              typingMode = false;
            }
        }
        break;
    }

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
                arrows.push(arrow);
                console.log(arrows);
                hasSelfArrow = true;
                break;
              }
            }
          }
          if (!hasSelfArrow) {
            selectedObj = tempArrow;
            arrows.push(tempArrow);

            // Add the arrow into the outArrows Set of its starting node
            tempArrow.circle.outArrows.add(tempArrow);            
          }
        } else if (tempArrow instanceof EntryArrow) {
          if (startState === null) {
            selectedObj = tempArrow;
            setStartState(tempArrow);
          }
        } else {
          selectedObj = tempArrow;
          arrows.push(tempArrow);

          // Add the arrow into the outArrows Set of its starting node
          tempArrow.startCircle.outArrows.add(tempArrow);
        }
        
      }
      tempArrow = null;
    }

    draw();
  });

  // This disables the default context menu on the canvas, since it was getting annoying
  // having to press Esc every time I right-clicked on an object when I wanted to type.
  canvas.addEventListener('contextmenu', event => event.preventDefault());

  // Whenever a key is pressed on the user's keyboard
  document.addEventListener('keydown', (event) => {
    // If the "Shift" key is pressed, set
    // shiftPressed = true, since it'll be used for
    // other functions on the canvas.
    if (event.key === 'Shift') {
      shiftPressed = true;
    } 

    // If we are currently selecting an object AND
    // if the currently selected object has a "text"
    // attribute, we will enter this if-statement
    if (selectedObj != null ) {
      if('text' in selectedObj){

        // This is for backspacing one letter at a time
        if(event.key === 'Backspace' && typingMode) {
          selectedObj.text = selectedObj.text.substring(0, selectedObj.text.length - 1);
          draw();
        }
        else {

          // If a key of length 1 was pressed (such as a number or
          // letter), we will append that character to the end of the 
          // "text" attribute of that object, which will then be 
          // displayed on the canvas
          if (event.key.length === 1 && typingMode) {

            // If the current object that is being typed on is an Arrow or SelfArrow,
            // then we will check if the character being typed is defined in the alphabet.
            // If not, we will alert the user.
            if(selectedObj instanceof Arrow || selectedObj instanceof SelfArrow){
              if(alphabet.has(event.key) || event.key === ','){
                
                selectedObj.text += event.key;
              }
              else{
                console.log(alphabet);
                console.log(event.key.constructor.name);
                alert(event.key + " is not defined in the alphabet!");
              }
            }
            else{
              selectedObj.text += event.key;
            }
            
            // After the new character has been appended to the object's
            // "text" attribute, we will draw the canvas again
            draw()
          }
        }
      }

      // If the "Delete" key is pressed on your keyboard
      if (event.key === 'Delete') {

        // Iterate through all circles that are present
        for (var circ = 0; circ < circles.length; circ++) {
          // If a circle is selected when "Delete" is pressed, 
          // then delete that specific circle
          if (circles[circ] == selectedObj) {
            circles.splice(circ--, 1);
          }
          
        }

        if(startState == selectedObj || startState?.pointsToCircle == selectedObj){
          setStartState(null);
        }

        // Iterate through all arrows that are present
        for (var i = 0; i < arrows.length; i++) {
          const arrow = arrows[i];

          // If an arrow is selected when "Delete" is pressed,
          // then delete that specific arrow
          if (arrow == selectedObj) {
            deleteArrow(arrow,i--);
          }

          // If an arrow is a SelfArrow (looped arrow)
          if (arrow instanceof SelfArrow) {

            // If the circle that the SelfArrow is looped
            // on is the object being currently selected, then
            // delete that SelfArrow as well since its associated
            // circle is being deleted
            if (arrow.circle == selectedObj){
              deleteArrow(arrow,i--);
            }
          }

          // If an arrow is a regular Arrow
          if (arrow instanceof Arrow) {

            // If either the startCircle or the endCircle of
            // this Arrow is the object being currently selected,
            // then delete the Arrow, since it will no longer
            // have two safe endpoints to be connected to
            if (arrow.startCircle == selectedObj || arrow.endCircle == selectedObj) {
              deleteArrow(arrow,i--);
            }
          } 
        }

        // After all the arrows and circles present have been
        // checked, we can draw the canvas again
        draw();

        console.log(arrows);
      }
      
    }
    
  });

  
  // If the arrow is being deleted, then update the
  // circles that it is associated with
  function deleteArrow(arrow: Arrow | SelfArrow | EntryArrow, index: number){
    if(arrow instanceof Arrow){
      arrow.startCircle.outArrows.delete(arrow);
    }
    else if(arrow instanceof SelfArrow){
      arrow.circle.outArrows.delete(arrow);
      arrow.circle.loop = null;
    }
    arrows.splice(index,1);
  }

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

    if(startState && startState.containsPoint(x,y)){
      return startState;
    }

    return null;
  }
}

/* -----------------------------------------------------------
 * Attach automatically when DOM is ready.
 * --------------------------------------------------------- */
function attachWhenReady() {
  const run = () => {
    const inputString = document.getElementById("inputString") as HTMLInputElement | null;
    const alphabetInput = document.getElementById("alphabet") as HTMLInputElement | null;
    const canvas = document.getElementById('DFACanvas') as HTMLCanvasElement | null;

    if (canvas)  {
      setupDfaCanvas(canvas)
    };

    if (inputString) {
      inputString.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          console.log("Submitting inputString:", inputString.value);

          var newInput = inputString.value;
          for(let char of newInput){
            if(!alphabet.has(char)){
              // Note to self: maybe make it so it goes through the entire string
              // first and collects every character that is wrong? Then give an alert
              // afterwards with every character that was wrong
              alert(char + " is not in the alphabet, this input is invalid!");
              break;
            }
          }
          
          dfaAlgo(newInput);

          inputString.value = "";
        }
      });
    }

    if (alphabetInput) {
      alphabetInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          console.log("Submitting alphabet:", alphabetInput.value);

          const newAlphabet = new Set(alphabetInput.value.trim().split(","));
          setAlphabet(newAlphabet);

          console.log(alphabet);

          alphabetInput.value = ""; 
        }
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run(); // DOM is already ready
  }
}

attachWhenReady();

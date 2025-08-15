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

// The previously edited object, which is determined by the object that was last
// under typing mode.
// This variable is crucial to determine when the transition determinism check
// needs to be ran, since exiting typing mode on an Arrow or SelfArrow will
// indicate that the user has submitted their transition.
var lastEditedObject: Arrow | SelfArrow | Circle | null = null; 

// This will store the previous text of an object before it is modified by the
// keydown listener.
// This variable is crucial for determining when to run the transitionDeterminismCheck,
// because if the text changes on an arrow, the transitionDeterminismCheck must run.
// If the text never changed, then no need to run the check.
var oldText: string = "";

var selectedObj: Circle | EntryArrow | Arrow | SelfArrow | null = null; // Currently selected object
var hightlightSelected = 'blue'; // Blue highlight for objects for regular selection
var base = 'black'; // Black highlight for objects to indicate that they are not being selected
var dragging = false; // True dragging objects is enabled, false otherwise
var shiftPressed = false; // True if shift is pressed, false otherwise
var startClick: {x: number, y: number} | null = null;
var tempArrow: TemporaryArrow | Arrow | SelfArrow | EntryArrow | null = null; // A new arrow being created

function setupDfaCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    // ctx?.translate(0.5, 0.5);

    // Iterate through ALL circles and draw each one
    for (var circle = 0; circle < circles.length; circle++) {
      ctx.lineWidth= 1;
      ctx.fillStyle = ctx.strokeStyle = (circles[circle] == selectedObj) ? hightlightSelected : base;
      circles[circle].draw(ctx);
    }

    // Iterate through ALL Arrows and SelfArrows and draw each one
    for (var arrow = 0; arrow < arrows.length; arrow++) {
      ctx.lineWidth = 1;
      ctx.fillStyle = ctx.strokeStyle = (arrows[arrow] == selectedObj) ? hightlightSelected : base;
      arrows[arrow].draw(ctx);
    }

    // If there is an EntryArrow, then draw it
    if(startState){
      ctx.lineWidth = 1;
      ctx.fillStyle = ctx.strokeStyle = (startState == selectedObj) ? hightlightSelected : base;
      startState.draw(ctx);
    }

    // If there is a TemporaryArrow being created, then draw it
    if (tempArrow != null) {
      ctx.lineWidth = 1;
      ctx.fillStyle = ctx.strokeStyle = base;
      tempArrow.draw(ctx);
    }
  }

  /* Event Handlers */
  // If a mouse button is pressed down
  canvas.addEventListener('mousedown', (event: MouseEvent) => {
    event.preventDefault();
    
    var mouse = getMousePos(event);
    
    // Check if the mouse has clicked on an object.
    // If true, then selectedObj will be updated.
    selectedObj = mouseCollision(mouse.x, mouse.y);
    dragging = false;
    startClick = mouse;

    // If the previously edited object was an Arrow or SelfArrow, AND if its text has been modified,
    // AND if the currently selected object is different from the previous edited Arrow or SelfArrow,
    // then we will run the transitionDeterminismCheck
    if((lastEditedObject instanceof Arrow || lastEditedObject instanceof SelfArrow) && oldText !== lastEditedObject.text && selectedObj !== lastEditedObject){
      // If the transitionDeterminismCheck returns true, that means the transition is valid.
      // So, we set oldText equal to the new text of the arrow. Thus, this if-statement won't
      // activate more than once, since the 2nd condition won't be fulfilled, because oldText and
      // the text of the lastEditedObject will be equal
      if(transitionDeterminismCheck(lastEditedObject)){
        oldText = lastEditedObject.text;
      }
      // If the transitionDeterminismCheck returns false, that means the transition is not valid.
      // So, we set oldText equal to the empty string, since the arrow's text will also have been
      // set to the empty string inside the transitionDeterminismCheck. Thus, this if-statement won't
      // activate more than once, since the 2nd condition won't be fulfilled, because oldText and
      // the text of the lastEditedObject will be equal
      else{
        oldText = "";
      }
    }

    // Update the previously edited object here
    if(selectedObj !== null && (
      selectedObj instanceof Arrow ||
      selectedObj instanceof SelfArrow ||
      selectedObj instanceof Circle)){
      lastEditedObject = selectedObj;
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

  // If mouse is double-clicked
  canvas.addEventListener('dblclick', (event) => {
    var mouse = getMousePos(event);
    selectedObj = mouseCollision(mouse.x, mouse.y);

    // If the mouse double-clicks an empty space, then
    // create a new Circle.
    if (selectedObj == null) {
      selectedObj = new Circle(mouse.x, mouse.y);
      if (selectedObj instanceof Circle) {
        circles.push(selectedObj);
        draw();
      }
    } 
    // If the mouse double-clicks a Circle, then make that
    // Circle an accept state
    else if (selectedObj instanceof Circle) {
      selectedObj.isAccept = !selectedObj.isAccept;
      draw();
    }
  });

  // If mouse moves
  canvas.addEventListener('mousemove', (event) => {
    var mouse = getMousePos(event);

    // If a new TemporaryArrow has been created, the
    // canvas must draw where it is going
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

  // If the mouse was originally clicked and now
  // the user let go
  canvas.addEventListener('mouseup', (event) =>{
    dragging = false;

    if (tempArrow != null) {
      if(!(tempArrow instanceof TemporaryArrow)) { 
        // When adding the tempArrow to the arrows array, 
        // Check if a self arrow points to the selected circle already
        
        if (tempArrow instanceof SelfArrow) {
          // Check to see if the circle that you are trying to 
          // create the SelfArrow on already has one
          if (!tempArrow.circle.loop) {
            // If the SelfArrow doesn't already exist for a state, 
            // but it is being created, then add it for that state
            selectedObj = tempArrow;
            arrows.push(tempArrow);

            // Set the pointer for the loop variable of the Circle
            // to the newly created SelfArrow
            tempArrow.circle.loop = tempArrow;

            // Add the arrow into the outArrows Set of its starting node
            tempArrow.circle.outArrows.add(tempArrow);            
          }
        } 
        else if (tempArrow instanceof EntryArrow) {
          // If the EntryArrow doesn't already exist, then
          // create one and set it as the new start state
          if (startState === null) {
            selectedObj = tempArrow;
            setStartState(tempArrow);
          }
        }
        // If the tempArrow isn't a SelfArrow or an EntryArrow
        // then it must be a regular arrow 
        else {
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
    if (selectedObj != null) {
      if('text' in selectedObj){
        // Store the text of the object before it changes, since
        // the 'text' attribute of the object will be directly modified
        // by this keydown listener
        oldText = selectedObj.text;

        // This is for backspacing one letter at a time
        if(event.key === 'Backspace') {
          selectedObj.text = selectedObj.text.substring(0, selectedObj.text.length - 1);
          draw();
        }
        else {

          // If a key of length 1 was pressed (such as a number or
          // letter), we will append that character to the end of the 
          // "text" attribute of that object, which will then be 
          // displayed on the canvas
          if (event.key.length === 1 ) {

            // If the current object that is being typed on is an Arrow or SelfArrow,
            // then we will check if the character being typed is defined in the alphabet.
            // If not, we will alert the user.
            if(selectedObj instanceof Arrow || selectedObj instanceof SelfArrow){
              if(alphabet.has(event.key) || event.key === ','){
                
                selectedObj.text += event.key;
              }
              else{
                // console.log(alphabet);
                // console.log(event.key.constructor.name);
                alert("\'" + event.key + "\' is not defined in the alphabet!");
              }
            }
            // Else, the selectedObj must be Circle, which we can type anything for
            else{
              selectedObj.text += event.key;
            }
          }

          // There is a strange edge-case where if you're typing a transition onto
          // an arrow, and if you press a key whose length is greater than 1 and has
          // not been defined in this nested if-statement (such as "Enter" or "Shift"),
          // it will allow the user to type certain strings that are not defined in
          // the alphabet. 
          // For example, let's say alphabet = {"0","1"}, and the user types "0,111,0"
          // as their transition for an arrow. Let's say before they click anywhere else,
          // they press Shift or Enter or some other key whose name is longer than 1
          // character, it will actually allow the transition "0,111,0" to be set as
          // the text of that arrow. This is wrong, since "111" is not defined in the 
          // alphabet. 
          // However, that transition won't be passed into the transition determinism 
          // check, so the transition Set  of the arrow still remains the same as it 
          // was before. This is clearly a problem and needs to be addressed. How to 
          // effectively to do it, I (Parth) am unsure as of right now.
          else{
            // if(selectedObj !== null && (
            //   selectedObj instanceof Arrow ||
            //   selectedObj instanceof SelfArrow)){

            //   lastEditedObject = selectedObj;

            //   // When you're typing the transition, the keydown listener checks if the
            //   // key pressed is in the alphabet. However, this is not enough.
            //   // This for-loop here will check if the entire transition itself is defined
            //   // in the alphabet.
            //   // For example, if the alphabet is {0,1}, but the transition is {00,01}, then
            //   // it should not work, since "00" and "01" are not in the alphabet.
            //   const newTransitions = selectedObj.text.trim().split(",");

            //   for(let newTransition of newTransitions){
            //     if(!alphabet.has(newTransition)){
            //       lastEditedObject.text = "";
            //       alert("\'" + newTransition + "\' has not been defined in the alphabet!");
            //       return false;
            //     }
            //   }
            // }
          }

          // After the new character has been appended to the object's
          // "text" attribute, we will draw the canvas again
          draw();
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

        // If the EntryArrow is the selected objected or if the circle that the
        // EntryArrow points to is the selected object, then delete the EntryArrow
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

  // Get the collided object at the point x, y.
  // Basically checks to see if the cursor is touching an object.
  // If it is, then return that specific object.
  // This function is used to set the selectedObj variable in the
  // mousedown eventListener and dblclick eventListener.
  function mouseCollision(x: number, y: number) {

    // Iterate through all circles. If a circle is selected by
    // the mouse, return that specific circle.
    for(var circ = 0; circ < circles.length; circ++) {
      if(circles[circ].containsPoint(x, y)) {
        return circles[circ];
      }
    }

    // Iterate through all Arrows and SelfArrows. If one of them is selected by
    // the mouse, return that specific Arrow or SelfArrow.
    for(var arrow = 0; arrow < arrows.length; arrow++) {
      if (arrows[arrow].containsPoint(x, y)) {
        return arrows[arrow];
      }
    }

    // Check if the startState is being selected by the mouse.
    // If it is, then return it.
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
    // Get the input tag for the input string of the DFA
    const inputString = document.getElementById("inputString") as HTMLInputElement | null;
    // Get the input tag for the alphabet input of the DFA
    const alphabetInput = document.getElementById("alphabet") as HTMLInputElement | null;
    // Get the canvas tag for the canvas of the DFA
    const canvas = document.getElementById('DFACanvas') as HTMLCanvasElement | null;

    if (canvas)  {
      setupDfaCanvas(canvas)
    };

    if (inputString) {
      inputString.addEventListener("keydown", (event) => {
        // If the "Enter" key is pressed on the input string
        if (event.key === "Enter") {
          event.preventDefault();
          console.log("Submitting inputString:", inputString.value);

          // Obtain the value entered
          var newInput = inputString.value.trim();

          // Check to see if it contains anything not defined in the alphabet.
          // If it contains undefined characters, alert the user
          for(let char of newInput){
            if(!alphabet.has(char)){
              // Note to self: maybe make it so it goes through the entire string
              // first and collects every character that is wrong? Then give an alert
              // afterwards with every character that was wrong
              alert("\'" + char + "\' is not in the alphabet, this input is invalid!");
              break;
            }
          }
          
          // Run the DFA algorithm
          dfaAlgo(newInput);
          
          // Reset the input tag
          inputString.value = "";
        }
      });
    }

    if (alphabetInput) {
      alphabetInput.addEventListener("keydown", (event) => {
        // If the "Enter" key is pressed on the alphabet input
        if (event.key === "Enter") {
          event.preventDefault();
          console.log("Submitting alphabet:", alphabetInput.value);

          // Obtain the input and update the alphabet variable
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

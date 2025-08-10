import {Circle} from "./circle";
import {Arrow} from "./arrow";
import {SelfArrow} from "./SelfArrow";
import {EntryArrow} from "./EntryArrow";

export var nodeRadius = 30;
export var selectedObj: Circle | EntryArrow | Arrow | SelfArrow | null = null;
export var snapToPadding = 10; // pixels
export var hitTargetPadding = 6; // pixels

// Creates subscript text to the input string using underscores before 0-9 as the regex
function subscriptText(text: string) {
  var subscriptText = text;
  for(var i = 0; i < 10; i++) {
    subscriptText = subscriptText.replace(new RegExp('_' + i, 'g'), String.fromCharCode(8320 + i));
  }
  return subscriptText;
}

export function drawText(
  ctx: CanvasRenderingContext2D,
  originalText: string,
  x: number,
  y: number,
  angeOrNull: number | null,
  isSelected: boolean
) {


  ctx.font = '20px Times New Roman', 'serif';
  var text = subscriptText(originalText)
  var width = ctx.measureText(text).width;
  x -= width / 2;

  if (angeOrNull != null) {
    var cos = Math.cos(angeOrNull);
    var sin = Math.sin(angeOrNull);
    var cornerPointX = (width / 2 + 5) * (cos > 0 ? 1 : -1);
		var cornerPointY = (10 + 5) * (sin > 0 ? 1 : -1);
		var slide = sin * Math.pow(Math.abs(sin), 40) * cornerPointX - cos * Math.pow(Math.abs(cos), 10) * cornerPointY;
		x += cornerPointX - sin * slide;
		y += cornerPointY + cos * slide;
  }
    x = Math.round(x);
    y = Math.round(y);
		ctx.fillText(text, x, y + 6);
}

export function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) {
  var dx = Math.cos(angle);
  var dy = Math.sin(angle);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - 10 * dx + 5 * dy, y - 8 * dy - 5 * dx);
  ctx.lineTo(x - 10 * dx - 5 *dy, y - 8 * dy + 5 * dx);
  ctx.fill();
}
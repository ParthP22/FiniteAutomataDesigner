/**
 * Utility functions for exporting finite automata diagrams to different formats.
 *
 * Provides helpers to:
 * - Format numbers (`fixed`)
 * - Escape text for XML (`textToXML`)
 * - Insert descriptive comments into serialized outputs (`addCircleComment`, `addCurvedArrowComment`,
 *   `addStraightArrowComment`, `addEntryArrowComment`, `addSelfArrowComment`)
 *
 * Supports both SVG (`<!-- ... -->`) and LaTeX (`%<!-- ... -->`) callers through the `CALLERS` enum.
 */
export const typeSVG = "svg";
export const typeLaTeX = "latex";
/**
 * Exists so that there aren't separate methods for both SVG and LaTeX
 */
export const CALLERS = {
    SVG: 'svg',
    LATEX: 'latex'
};
/**
 * Formats a number to a fixed number of decimal places,
 * trimming unnecessary trailing zeros and decimal points
 *
 * @param number
 * @param digits
 * @returns
 */
export function fixed(number, digits) {
    return number.toFixed(digits).replace(/0+$/, '').replace(/\.$/, '');
}
/**
 * Escapes special characters in a string for safe inclusion in XML.
 * Converts `&`, `<`, and `>` into their XML entities, and encodes
 * non-printable or non-ASCII characters as numeric character references.
 *
 * @param text - The input string to escape
 * @returns A safe XML-encoded string
 */
export function textToXML(text) {
    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let result = '';
    for (let i = 0; i < text.length; i++) {
        let c = text.charCodeAt(i);
        if (c >= 0x20 && c <= 0x7E) {
            result += text[i];
        }
        else {
            result += '&#' + c + ';';
        }
    }
    return result;
}
export function addCircleComment(caller, _data, id, x, y, accept, text) {
    if (caller == CALLERS.SVG) {
        _data += `\t<!-- Circle: id=${id}, x=${fixed(x, 3)}, y=${fixed(y, 3)}, accept=${accept}, text=${text} -->\n`;
    }
    else if (caller == CALLERS.LATEX) {
        _data += `\t%<!-- Circle: id=${id}, x=${fixed(x, 3)}, y=${fixed(y, 3)}, accept=${accept}, text=${text} -->\n`;
    }
    return _data;
}
export function addCurvedArrowComment(caller, _data, fromId, toId, parallel, perpendicular, label) {
    if (caller == CALLERS.SVG) {
        _data += `\t<!-- CurvedArrow: from=${fromId}, to=${toId}, parallel=${parallel}, perpendicular=${perpendicular}, label=${label} -->\n`;
    }
    else if (caller == CALLERS.LATEX) {
        _data += `\t%<!-- CurvedArrow: from=${fromId}, to=${toId}, parallel=${parallel}, perpendicular=${perpendicular}, label=${label} -->\n`;
    }
    return _data;
}
export function addStraightArrowComment(caller, _data, fromId, toId, label) {
    if (caller == CALLERS.SVG) {
        _data += `\t<!-- StraightArrow: from=${fromId}, to=${toId}, label=${label} -->\n`;
    }
    else if (caller == CALLERS.LATEX) {
        _data += `\t%<!-- StraightArrow: from=${fromId}, to=${toId}, label=${label} -->\n`;
    }
    return _data;
}
export function addEntryArrowComment(caller, _data, toId, startX, startY) {
    if (caller == CALLERS.SVG) {
        _data += `\t<!-- EntryArrow: to=${toId}, start=(${fixed(startX, 3)},${fixed(startY, 3)}) -->\n`;
    }
    else if (caller == CALLERS.LATEX) {
        _data += `\t%<!-- EntryArrow: to=${toId}, start=(${fixed(startX, 3)},${fixed(startY, 3)}) -->\n`;
    }
    return _data;
}
export function addSelfArrowComment(caller, _data, circleId, anchorX, anchorY, text) {
    if (caller == CALLERS.SVG) {
        _data += `\t<!-- SelfArrow: circle=${circleId}, anchor=(${fixed(anchorX, 3)},${fixed(anchorY, 3)}), text=${text} -->\n`;
    }
    else if (caller == CALLERS.LATEX) {
        _data += `\t%<!-- SelfArrow: circle=${circleId}, anchor=(${fixed(anchorX, 3)},${fixed(anchorY, 3)}), text=${text} -->\n`;
    }
    return _data;
}
export function addAlphabetComment(caller, _data, alphabet) {
    const stringifiedAlphabet = Array.from(alphabet).join(',');
    console.log(stringifiedAlphabet);
    if (caller == CALLERS.SVG) {
        _data += `\t<!-- Alphabet: ${stringifiedAlphabet} -->\n`;
    }
    else if (caller == CALLERS.LATEX) {
        _data += `\t%<!-- Alphabet ${stringifiedAlphabet} -->\n`;
    }
    return _data;
}

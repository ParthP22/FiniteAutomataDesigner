export const CALLERS = {
    SVG: 'svg',
    LATEX: 'latex'
}

export function fixed(number: number, digits: number): string {
	return number.toFixed(digits).replace(/0+$/, '').replace(/\.$/, '');
}

export function addCircleComment(caller: string, _data: string, id: string, x: number, y: number, accept: boolean, text: string) {
    if (caller == CALLERS.SVG) {
        _data += `\t<!-- Circle: id=${id}, x=${fixed(x, 3)}, y=${fixed(y, 3)}, accept=${accept}, text=${text} -->\n`;
    } else if (caller == CALLERS.LATEX) {
        _data += `\t%<!-- Circle: id=${id}, x=${fixed(x, 3)}, y=${fixed(y, 3)}, accept=${accept}, text=${text} -->\n`;
    }
    return _data;
}

export function addCurvedArrowComment(caller: string, _data: string, fromId: string, toId: string, parallel: number, perpendicular: number, label: string) {
    if (caller == CALLERS.SVG) {
        _data += `\t<!-- CurvedArrow: from=${fromId}, to=${toId}, parallel=${parallel}, perpendicular=${perpendicular}, label=${label} -->\n`;
    } else if (caller == CALLERS.LATEX ) {
        _data += `\t%<!-- CurvedArrow: from=${fromId}, to=${toId}, parallel=${parallel}, perpendicular=${perpendicular}, label=${label} -->\n`;
    }
    return _data;
}

export function addStraightArrowComment(caller: string, _data: string, fromId: string, toId: string, label: string) {
    if (caller == CALLERS.SVG) {
        _data += `\t<!-- StraightArrow: from=${fromId}, to=${toId}, label=${label} -->\n`;
    } else if (caller == CALLERS.LATEX ) {
        _data += `\t%<!-- StraightArrow: from=${fromId}, to=${toId}, label=${label} -->\n`;
    }
    
    return _data;
}

export function addEntryArrowComment(caller: string, _data: string, toId: string, startX: number, startY: number) {
    if (caller == CALLERS.SVG) {
        _data += `\t<!-- EntryArrow: to=${toId}, start=(${fixed(startX, 3)},${fixed(startY, 3)}) -->\n`;
    } else if (caller == CALLERS.LATEX ) {
        _data += `\t%<!-- EntryArrow: to=${toId}, start=(${fixed(startX, 3)},${fixed(startY, 3)}) -->\n`;
    }
    
     return _data;
}

export function addSelfArrowComment(caller: string, _data: string, circleId: string, anchorX: number, anchorY: number, text: string) {
    if (caller == CALLERS.SVG) {
        _data += `\t<!-- SelfArrow: circle=${circleId}, anchor=(${fixed(anchorX, 3)},${fixed(anchorY, 3)}), text=${text} -->\n`;
    } else if (caller == CALLERS.LATEX ) {
        _data += `\t%<!-- SelfArrow: circle=${circleId}, anchor=(${fixed(anchorX, 3)},${fixed(anchorY, 3)}), text=${text} -->\n`;
    } 
    
     return _data;
}

export function textToXML(text: string): string{
	text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	let result = '';
	for(let i = 0; i < text.length; i++) {
		let c = text.charCodeAt(i);
		if(c >= 0x20 && c <= 0x7E) {
			result += text[i];
		} else {
			result += '&#' + c + ';';
		}
	}
	return result;
}
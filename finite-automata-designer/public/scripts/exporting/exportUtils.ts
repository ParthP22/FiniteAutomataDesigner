export function fixed(number: number, digits: number): string {
	return number.toFixed(digits).replace(/0+$/, '').replace(/\.$/, '');
}

export function addCircleComment(_data: string, id: string, x: number, y: number, accept: boolean, text: string) {
    _data += `\t<!-- Circle: id=${id}, x=${fixed(x, 3)}, y=${fixed(y, 3)}, accept=${accept}, text=${text} -->\n`;
    return _data;
}

export function addCurvedArrowComment(_data: string, fromId: string, toId: string, parallel: number, perpendicular: number, label: string) {
    _data += `\t<!-- CurvedArrow: from=${fromId}, to=${toId}, parallel=${parallel}, perpendicular=${perpendicular}, label=${label} -->\n`;
    return _data;
}

export function addStraightArrowComment(_data: string, fromId: string, toId: string, label: string) {
     _data += `\t<!-- StraightArrow: from=${fromId}, to=${toId}, label=${label} -->\n`;
     return _data;
}

export function addEntryArrowComment(_data: string, toId: string, startX: number, startY: number) {
     _data += `\t<!-- EntryArrow: to=${toId}, start=(${fixed(startX, 3)},${fixed(startY, 3)}) -->\n`;
     return _data;
}

export function addSelfArrowComment(_data: string, circleId: string, anchorX: number, anchorY: number, text: string) {
     _data += `\t<!-- SelfArrow: circle=${circleId}, anchor=(${fixed(anchorX, 3)},${fixed(anchorY, 3)}), text=${text} -->\n`;
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
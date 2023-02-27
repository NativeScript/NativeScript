import Node from '../node/Node';

/**
 * Character data base class.
 *
 * Reference:
 * https://developer.mozilla.org/en-US/docs/Web/API/CharacterData.
 */
export default abstract class CharacterData extends Node {
	get data(): string {
		return this.data;
	}

	set data(data) {
		this.data = data;
	}
	get length() {
		return this.data.length;
	}

	get nodeValue() {
		return this.data;
	}
	set nodeValue(data) {
		this.data = data;
	}

	get textContent() {
		return this.data;
	}
	set textContent(text) {
		this.data = `${text}`;
	}

	appendData(data: string) {
		this.data += data;
	}
}

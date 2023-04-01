export class DOMTokenList {
	constructor(public element: any) {}
	changeTimer: NodeJS.Timeout;

	get tokenList() {
		return (this.element['cssClasses'] as Set<string>) || (this.element['cssClasses'] = new Set<string>());
	}

	remove(value: any) {
		this.tokenList.delete(value);
		this.onChange();
		return true;
	}
	contains(value: any) {
		return this.tokenList.has(value);
	}

	replace(token: string, oldToken: string) {
		this.tokenList.delete(oldToken);
		this.tokenList.add(token);
		this.onChange();
	}

	add(value: any) {
		this.tokenList.add(value);
		this.onChange();
	}

	item(index: number) {
		const values = Array.from(this.tokenList.values());
		return values[index];
	}

	toggle(value: any, force?: boolean) {
		let returnValue = false;
		if (force === true) {
			this.tokenList.add(value);
			returnValue = true;
		} else if (force === false) {
			this.tokenList.delete(value);
			returnValue = false;
		} else {
			if (this.tokenList.has(value)) {
				this.tokenList.delete(value);
				returnValue = false;
			} else {
				this.tokenList.add(value);
				returnValue = true;
			}
		}
		this.onChange();
		return returnValue;
	}

	get value() {
		return this.toString();
	}

	set value(value: any) {
		const tokens = value.split(' ');
		for (const token of tokens) {
			this.tokenList.add(token);
		}
		this.onChange();
	}
	onChange() {
		if (this.element['_onCssStateChange']) {
			clearTimeout(this.changeTimer);
			this.changeTimer = setTimeout(() => {
				this.element['_onCssStateChange']();
			}, 0);
		}
	}

	toString() {
		let value = '';
		for (const token in this.tokenList.values()) {
			value += ' ' + token;
		}
		return value;
	}

	get length() {
		return this.tokenList.size;
	}
}

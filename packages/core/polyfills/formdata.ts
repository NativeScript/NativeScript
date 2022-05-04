
export class FormData {
	private _data: Map<string, any>;

	constructor() {
		this._data = new Map<string, any>();
	}

	append(name: string, value: any) {
		this._data.set(name, value);
	}

	toString(): string {
		const arr = new Array<string>();

		this._data.forEach(function (value, name, map) {
			arr.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
		});

		return arr.join('&');
	}
}
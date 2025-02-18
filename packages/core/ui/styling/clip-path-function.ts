type ClipPathShape = 'rect' | 'circle' | 'ellipse' | 'polygon' | 'inset';

interface IClipPathFunction {
	shape: ClipPathShape;
	rule: string;
}

export class ClipPathFunction implements IClipPathFunction {
	private readonly _shape: ClipPathShape;
	private readonly _rule: string;

	constructor(shape: ClipPathShape, rule: string) {
		this._shape = shape;
		this._rule = rule;
	}

	get shape(): ClipPathShape {
		return this._shape;
	}

	get rule(): string {
		return this._rule;
	}

	public static equals(value1: ClipPathFunction, value2: ClipPathFunction): boolean {
		return value1.shape === value2.shape && value1.rule === value2.rule;
	}

	toJSON(): IClipPathFunction {
		return {
			shape: this._shape,
			rule: this._rule,
		};
	}

	toString(): string {
		return `${this._shape}(${this._rule})`;
	}
}

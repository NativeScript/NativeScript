// Types shared between core-types and animation-interfaces

/**
 * Defines a custom animation timing curve by using the cubic-bezier function.
 * Possible values are numeric values from 0 to 1
 */
export class CubicBezierAnimationCurve {
	public x1: number;
	public y1: number;
	public x2: number;
	public y2: number;

	constructor(x1: number, y1: number, x2: number, y2: number) {
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
	}
}

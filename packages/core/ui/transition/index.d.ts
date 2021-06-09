export class Transition {
	static AndroidTransitionType: { enter: string; exit: string; popEnter: string; popExit: string };
	constructor(duration: number, nativeCurve: any);
	public getDuration(): number;
	public getCurve(): any;
	public animateIOSTransition(containerView: any, fromView: any, toView: any, operation: any, completion: (finished: boolean) => void): void;
	public createAndroidAnimator(transitionType: string): any;
	public toString(): string;
}

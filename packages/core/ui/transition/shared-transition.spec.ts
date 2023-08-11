import { GestureTypes } from '../gestures';
import { SharedTransition, SharedTransitionAnimationType } from './shared-transition';

describe('SharedTransition', () => {
	it('custom should create a Transition instance', () => {
		const transition = SharedTransition.custom(new CustomTransition());
		expect(transition.instance.id).toBe(1);
	});
	it('custom should create a Transition with default state and options', () => {
		const transition = SharedTransition.custom(new CustomTransition());
		const state = SharedTransition.getState(transition.instance.id);
		expect(state.activeType).toBe(SharedTransitionAnimationType.present);
		expect(state.pageStart).toBeUndefined();
		expect(state.pageEnd).toBeUndefined();
		expect(state.pageReturn).toBeUndefined();
		expect(state.interactive).toBeUndefined();
	});
	it('custom should create a Transition with custom options', () => {
		const transition = SharedTransition.custom(new CustomTransition(), {
			interactive: {
				dismiss: {
					finishThreshold: 0.6,
					percentFormula: (args) => {
						return args.deltaX - 0.2;
					},
				},
			},
			pageStart: {
				x: 200,
				y: 100,
				spring: {
					friction: 40,
				},
			},
			pageEnd: {
				x: 0,
				y: 0,
			},
			pageReturn: {
				x: -200,
				y: -100,
				width: 25,
			},
		});
		const state = SharedTransition.getState(transition.instance.id);
		expect(state.activeType).toBe(SharedTransitionAnimationType.present);
		expect(state.interactive.dismiss.finishThreshold).toBe(0.6);
		expect(state.interactive.dismiss.percentFormula({ deltaX: 0.9, deltaY: 0, state: 0, android: null, eventName: 'pan', ios: null, object: null, type: GestureTypes.pan, view: null })).toBe(0.7);
		expect(state.pageStart.x).toBe(200);
		expect(state.pageStart.y).toBe(100);
		expect(state.pageStart.spring.friction).toBe(40);
		expect(state.pageEnd.x).toBe(0);
		expect(state.pageEnd.y).toBe(0);
		expect(state.pageReturn.x).toBe(-200);
		expect(state.pageReturn.y).toBe(-100);
		expect(state.pageReturn.width).toBe(25);
	});
});

class CustomTransition {
	id: number;
	constructor() {
		this.id = 1;
	}

	getDuration() {
		return 0.35;
	}

	setDuration(value: number) {}
	getCurve() {}
	animateIOSTransition() {}
	createAndroidAnimator() {}
}

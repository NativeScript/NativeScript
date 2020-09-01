import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import * as viewModule from '@nativescript/core/ui/core/view';
import { Label } from '@nativescript/core/ui/label';
import { StackLayout } from '@nativescript/core/ui/layouts/stack-layout';
import * as colorModule from '@nativescript/core/color';
import * as enums from '@nativescript/core/ui/enums';
import { AnimationPromise } from '@nativescript/core/ui/animation';

// >> animation-require
import * as animation from '@nativescript/core/ui/animation';
import { PercentLength } from '@nativescript/core/ui/styling/style-properties';
// << animation-require

function prepareTest(parentHeight?: number, parentWidth?: number): Label {
	let mainPage = helper.getCurrentPage();
	let label = new Label();
	label.text = 'label';

	let stackLayout = new StackLayout();
	// optionally size the parent extent to make assertions about percentage values
	if (parentHeight !== undefined) {
		stackLayout.height = PercentLength.parse(parentHeight + '');
	}
	if (parentWidth !== undefined) {
		stackLayout.width = PercentLength.parse(parentWidth + '');
	}
	stackLayout.addChild(label);
	mainPage.content = stackLayout;
	TKUnit.waitUntilReady(() => label.isLoaded);

	return label;
}

export function test_AnimatingProperties(done) {
	let label = prepareTest();

	// >> animation-properties
	label
		.animate({
			opacity: 0.75,
			backgroundColor: new colorModule.Color('Red'),
			translate: { x: 100, y: 100 },
			scale: { x: 2, y: 2 },
			rotate: 180,
			duration: 5,
			delay: 10,
			iterations: 3,
			curve: enums.AnimationCurve.easeIn,
		})
		.then(() => {
			//console.log("Animation finished.");
			// >> (hide)
			assertIOSNativeTransformIsCorrect(label);
			done();
			// << (hide)
		})
		.catch((e) => {
			console.log(e.message);
			// >> (hide)
			done(e);
			// << (hide)
		});
	// << animation-properties
}

export function test_PlayRejectsWhenAlreadyPlayingAnimation(done) {
	let label = prepareTest();

	var animation = label.createAnimation({ translate: { x: 100, y: 100 }, duration: 5 });

	animation.play();
	animation.play().then(
		() => {
			// should never get here
			throw new Error('Already playing.');
		},
		(e) => {
			TKUnit.assert(animation.isPlaying === true, "animation.isPlaying should be true since it's currently playing.");
			if (e === 'Animation is already playing.') {
				done();
			}
		}
	);
}

export function test_CancelIgnoredWhenNotPlayingAnimation() {
	let label = prepareTest();

	var animation = label.createAnimation({ translate: { x: 100, y: 100 }, duration: 5 });
	animation.cancel(); // should not throw
	TKUnit.assert(!animation.isPlaying, 'animation.isPlaying should be falsey since it was never played.');
}

export function test_CancellingAnimation(done) {
	let label = prepareTest();

	// >> animation-cancel
	var animation1 = label.createAnimation({ translate: { x: 100, y: 100 }, duration: 5 });

	animation1
		.play()
		.then(() => {
			//console.log("Animation finished");
			// >> (hide)
			throw new Error('Cancelling Animation - Should not be in the Promise Then()');
			// << (hide)
		})
		.catch((e) => {
			//console.log("Animation cancelled");
			// >> (hide)
			if (!e) {
				done(new Error('Cancel path did not have proper error'));
			} else if (e.toString() === 'Error: Animation cancelled.') {
				done();
			} else {
				done(e);
			}
			// << (hide)
		});
	animation1.cancel();
	// << animation-cancel
}

export function test_CancellingAnimate(done) {
	let label = prepareTest();

	// >> animation-cancel2
	var animation1 = label
		.animate({ translate: { x: 100, y: 100 }, duration: 5 })
		.then(() => {
			//console.log("Animation finished");
			// >> (hide)
			throw new Error('Cancelling Animate - Should not be in Promise Then()');
			// << (hide)
		})
		.catch((e) => {
			//console.log("Animation cancelled");
			// >> (hide)
			if (!e) {
				done(new Error('Cancel path did not have proper error'));
			} else if (e.toString() === 'Error: Animation cancelled.') {
				done();
			} else {
				done(e);
			}
			// << (hide)
		});
	(<AnimationPromise>animation1).cancel();
	// << animation-cancel2
}

export function test_ChainingAnimations(done) {
	let label = prepareTest();

	// >> animation-chaining
	let duration = 300;
	// >> (hide)
	duration = 5;
	// << (hide)
	label
		.animate({ opacity: 0, duration: duration })
		.then(() => label.animate({ opacity: 1, duration: duration }))
		.then(() => label.animate({ translate: { x: 200, y: 200 }, duration: duration }))
		.then(() => label.animate({ translate: { x: 0, y: 0 }, duration: duration }))
		.then(() => label.animate({ scale: { x: 5, y: 5 }, duration: duration }))
		.then(() => label.animate({ scale: { x: 1, y: 1 }, duration: duration }))
		.then(() => label.animate({ rotate: 180, duration: duration }))
		.then(() => label.animate({ rotate: 0, duration: duration }))
		.then(() => {
			//console.log("Animation finished");
			// >> (hide)
			assertIOSNativeTransformIsCorrect(label);
			done();
			// << (hide)
		})
		.catch((e) => {
			console.log(e.message);
			// >> (hide)
			done(e);
			// << (hide)
		});
	// << animation-chaining
}

export function test_ReusingAnimations(done) {
	let label = prepareTest();

	// >> animation-reusing
	var animation1 = label.createAnimation({ translate: { x: 100, y: 100 }, duration: 5 });
	var animation2 = label.createAnimation({ translate: { x: 0, y: 0 }, duration: 5 });

	animation1
		.play()
		.then(() => animation2.play())
		.then(() => animation1.play())
		.then(() => animation2.play())
		.then(() => animation1.play())
		.then(() => animation2.play())
		.then(() => {
			//console.log("Animation finished");
			// >> (hide)
			assertIOSNativeTransformIsCorrect(label);
			done();
			// << (hide)
		})
		.catch((e) => {
			console.log(e.message);
			// >> (hide)
			done(e);
			// << (hide)
		});
	// << animation-reusing
}

export function test_AnimatingMultipleViews(done) {
	let mainPage = helper.getCurrentPage();
	let label1 = new Label();
	label1.text = 'label1';
	let label2 = new Label();
	label2.text = 'label2';
	let label3 = new Label();
	label3.text = 'label3';
	let stackLayout = new StackLayout();
	stackLayout.addChild(label1);
	stackLayout.addChild(label2);
	stackLayout.addChild(label3);
	mainPage.content = stackLayout;
	TKUnit.waitUntilReady(() => label3.isLoaded);

	// >> animation-multiple-views
	var animations: Array<animation.AnimationDefinition> = [
		{ target: label1, translate: { x: 200, y: 200 }, duration: 5, delay: 0 },
		{ target: label2, translate: { x: 200, y: 200 }, duration: 5, delay: 2 },
		{ target: label3, translate: { x: 200, y: 200 }, duration: 5, delay: 4 },
	];
	var a = new animation.Animation(animations);
	a.play()
		.then(() => {
			//console.log("Animations finished");
			// >> (hide)
			assertIOSNativeTransformIsCorrect(label1);
			assertIOSNativeTransformIsCorrect(label2);
			assertIOSNativeTransformIsCorrect(label3);
			done();
			// << (hide)
		})
		.catch((e) => {
			console.log(e.message);
			// >> (hide)
			done(e);
			// << (hide)
		});
	// << animation-multiple-views
}

export function test_AnimateOpacity(done) {
	let label = prepareTest();

	label
		.animate({ opacity: 0.75, duration: 5 })
		.then(() => {
			TKUnit.assertEqual(label.opacity, 0.75, 'label.opacity');
			done();
		})
		.catch((e) => {
			done(e);
		});
}

export function test_AnimateOpacity_ShouldThrow_IfNotNumber() {
	var label = new Label();
	helper.buildUIAndRunTest(label, (views: Array<viewModule.View>) => {
		TKUnit.assertThrows(() => {
			label.animate({ opacity: <any>'0.75' });
		}, 'Setting opacity to a non number should throw.');
	});
}

export function test_AnimateDelay_ShouldThrow_IfNotNumber() {
	var label = new Label();
	helper.buildUIAndRunTest(label, (views: Array<viewModule.View>) => {
		TKUnit.assertThrows(() => {
			label.animate({ delay: <any>'1' });
		}, 'Setting delay to a non number should throw.');
	});
}

export function test_AnimateDuration_ShouldThrow_IfNotNumber() {
	var label = new Label();
	helper.buildUIAndRunTest(label, (views: Array<viewModule.View>) => {
		TKUnit.assertThrows(() => {
			label.animate({ duration: <any>'1' });
		}, 'Setting duration to a non number should throw.');
	});
}

export function test_AnimateIterations_ShouldThrow_IfNotNumber() {
	var label = new Label();
	helper.buildUIAndRunTest(label, (views: Array<viewModule.View>) => {
		TKUnit.assertThrows(() => {
			label.animate({ iterations: <any>'1' });
		}, 'Setting iterations to a non number should throw.');
	});
}

export function test_AnimateRotate_ShouldThrow_IfNotNumber() {
	var label = new Label();
	helper.buildUIAndRunTest(label, (views: Array<viewModule.View>) => {
		TKUnit.assertThrows(() => {
			label.animate({ rotate: <any>'1' });
		}, 'Setting rotate to a non number should throw.');
	});
}

export function test_AnimateScale_ShouldThrow_IfNotPair() {
	var label = new Label();
	helper.buildUIAndRunTest(label, (views: Array<viewModule.View>) => {
		TKUnit.assertThrows(() => {
			label.animate({ scale: <any>'1' });
		}, 'Setting scale to a non Pair should throw.');
	});
}

export function test_AnimateTranslate_ShouldThrow_IfNotPair() {
	var label = new Label();
	helper.buildUIAndRunTest(label, (views: Array<viewModule.View>) => {
		TKUnit.assertThrows(() => {
			label.animate({ translate: <any>'1' });
		}, 'Setting translate to a non Pair should throw.');
	});
}

export function test_AnimateBackgroundColor_ShouldThrow_IfNotValidColorStringOrColor() {
	var label = new Label();
	helper.buildUIAndRunTest(label, (views: Array<viewModule.View>) => {
		TKUnit.assertThrows(() => {
			label.animate({ backgroundColor: <any>'test' });
		}, 'Setting backgroundColor to a not valid color string or Color should throw.');
	});
}

export function test_AnimateBackgroundColor(done) {
	let label = prepareTest();
	var red = new colorModule.Color('Red');

	label
		.animate({ backgroundColor: red, duration: 5 })
		.then(() => {
			TKUnit.assert((<colorModule.Color>label.backgroundColor).equals(red));
			done();
		})
		.catch((e) => {
			done(e);
		});
}

export function test_AnimateBackgroundColor_FromString(done) {
	let label = prepareTest();
	var expected = 'Red';
	var clr = new colorModule.Color(expected);

	label
		.animate({ backgroundColor: <any>expected, duration: 5 })
		.then(() => {
			TKUnit.assert((<colorModule.Color>label.backgroundColor).equals(clr));
			done();
		})
		.catch((e) => {
			done(e);
		});
}

export function test_AnimateTranslate(done) {
	let label = prepareTest();

	label
		.animate({ translate: { x: 100, y: 200 }, duration: 5 })
		.then(() => {
			TKUnit.assertEqual(label.translateX, 100, 'label.translateX');
			TKUnit.assertEqual(label.translateY, 200, 'label.translateY');
			assertIOSNativeTransformIsCorrect(label);
			done();
		})
		.catch((e) => {
			done(e);
		});
}

export function test_AnimateScale(done) {
	let label = prepareTest();

	label
		.animate({ scale: { x: 2, y: 3 }, duration: 5 })
		.then(() => {
			TKUnit.assertEqual(label.scaleX, 2, 'label.scaleX');
			TKUnit.assertEqual(label.scaleY, 3, 'label.scaleY');
			assertIOSNativeTransformIsCorrect(label);
			done();
		})
		.catch((e) => {
			done(e);
		});
}

export function test_AnimateRotate(done) {
	let label = prepareTest();

	label
		.animate({ rotate: 123, duration: 5 })
		.then(() => {
			TKUnit.assertEqual(label.rotate, 123, 'label.rotate');
			assertIOSNativeTransformIsCorrect(label);
			done();
		})
		.catch((e) => {
			done(e);
		});
}

function animateExtentAndAssertExpected(along: 'height' | 'width', value: PercentLength, pixelExpected: PercentLength): Promise<void> {
	function pretty(val) {
		return JSON.stringify(val, null, 2);
	}
	const parentExtent = 200;
	const height = along === 'height' ? parentExtent : undefined;
	const width = along === 'height' ? undefined : parentExtent;
	const label = prepareTest(height, width);
	const props = {
		duration: 5,
		[along]: value,
	};

	return label.animate(props).then(() => {
		const observedString: string = PercentLength.convertToString(label[along]);
		const inputString: string = PercentLength.convertToString(value);
		TKUnit.assertEqual(observedString, inputString, `PercentLength.convertToString(${pretty(value)}) should be "${inputString}" but is "${observedString}"`);
		// assert that the animated view"s calculated pixel extent matches the expected pixel value
		const observedNumber: number = PercentLength.toDevicePixels(label[along], parentExtent, parentExtent);
		const expectedNumber: number = PercentLength.toDevicePixels(pixelExpected, parentExtent, parentExtent);
		TKUnit.assertEqual(observedNumber, expectedNumber, `PercentLength.toDevicePixels(${inputString}) should be "${expectedNumber}" but is "${observedNumber}"`);

		assertIOSNativeTransformIsCorrect(label);
	});
}

export function test_AnimateExtent_Should_ResolvePercentageStrings(done) {
	let promise: Promise<any> = Promise.resolve();
	const pairs: [string, string][] = [
		['100%', '200px'],
		['50%', '100px'],
		['25%', '50px'],
		['-25%', '-50px'],
		['-50%', '-100px'],
		['-100%', '-200px'],
	];
	pairs.forEach((pair) => {
		const input = PercentLength.parse(pair[0]);
		const expected = PercentLength.parse(pair[1]);
		promise = promise.then(() => {
			return animateExtentAndAssertExpected('height', input, expected);
		});
		promise = promise.then(() => {
			return animateExtentAndAssertExpected('width', input, expected);
		});
	});
	promise.then(() => done()).catch(done);
}

export function test_AnimateExtent_Should_AcceptStringPixelValues(done) {
	let promise: Promise<any> = Promise.resolve();
	const pairs: [string, number][] = [
		['100px', 100],
		['50px', 50],
	];
	pairs.forEach((pair) => {
		const input = PercentLength.parse(pair[0]);
		const expected = {
			unit: 'px',
			value: pair[1],
		} as PercentLength;
		promise = promise.then(() => {
			return animateExtentAndAssertExpected('height', input, expected);
		});
		promise = promise.then(() => {
			return animateExtentAndAssertExpected('width', input, expected);
		});
	});
	promise.then(() => done()).catch(done);
}

export function test_AnimateExtent_Should_AcceptNumberValuesAsDip(done) {
	let promise: Promise<any> = Promise.resolve();
	const inputs: any[] = [200, 150, 100, 50, 0];
	inputs.forEach((value) => {
		const parsed = PercentLength.parse(value);
		promise = promise.then(() => {
			return animateExtentAndAssertExpected('height', parsed, parsed);
		});
		promise = promise.then(() => {
			return animateExtentAndAssertExpected('width', parsed, parsed);
		});
	});
	promise.then(() => done()).catch(done);
}

export function test_AnimateExtent_Should_ThrowIfCannotParsePercentLength() {
	const label = new Label();
	helper.buildUIAndRunTest(label, (views: Array<viewModule.View>) => {
		TKUnit.assertThrows(() => {
			label.animate({ width: '-frog%' });
		}, 'Invalid percent string should throw');
		TKUnit.assertThrows(() => {
			label.animate({ height: '-frog%' });
		}, 'Invalid percent string should throw');
	});
}

export function test_AnimateTranslateScaleAndRotateSimultaneously(done) {
	let label = prepareTest();

	label
		.animate({
			translate: { x: 100, y: 200 },
			scale: { x: 2, y: 3 },
			rotate: 123,
			duration: 5,
		})
		.then(() => {
			TKUnit.assertEqual(label.translateX, 100, 'label.translateX');
			TKUnit.assertEqual(label.translateY, 200, 'label.translateY');
			TKUnit.assertEqual(label.scaleX, 2, 'label.scaleX');
			TKUnit.assertEqual(label.scaleY, 3, 'label.scaleY');
			TKUnit.assertEqual(label.rotate, 123, 'label.rotate');
			assertIOSNativeTransformIsCorrect(label);
			done();
		})
		.catch((e) => {
			done(e);
		});
}

export function test_AnimateTranslateScaleAndRotateSequentially(done) {
	let label = prepareTest();

	label
		.animate({ translate: { x: 100, y: 200 }, duration: 5 })
		.then(() => {
			TKUnit.assertEqual(label.translateX, 100, 'label.translateX');
			TKUnit.assertEqual(label.translateY, 200, 'label.translateY');
			assertIOSNativeTransformIsCorrect(label);

			return label.animate({ scale: { x: 2, y: 3 }, duration: 5 });
		})
		.then(() => {
			TKUnit.assertEqual(label.translateX, 100, 'label.translateX');
			TKUnit.assertEqual(label.translateY, 200, 'label.translateY');
			TKUnit.assertEqual(label.scaleX, 2, 'label.scaleX');
			TKUnit.assertEqual(label.scaleY, 3, 'label.scaleY');
			assertIOSNativeTransformIsCorrect(label);

			return label.animate({ rotate: 123, duration: 5 });
		})
		.then(() => {
			TKUnit.assertEqual(label.translateX, 100, 'label.translateX');
			TKUnit.assertEqual(label.translateY, 200, 'label.translateY');
			TKUnit.assertEqual(label.scaleX, 2, 'label.scaleX');
			TKUnit.assertEqual(label.scaleY, 3, 'label.scaleY');
			TKUnit.assertEqual(label.rotate, 123, 'label.rotate');
			assertIOSNativeTransformIsCorrect(label);
			done();
		})
		.catch((e) => {
			done(e);
		});
}

export function test_AnimationsAreAlwaysPlayed(done) {
	let label = prepareTest();

	var animation1 = label.createAnimation({ opacity: 0, duration: 5 });
	var animation2 = label.createAnimation({ opacity: 1, duration: 5 });

	animation1
		.play()
		.then(() => {
			TKUnit.assert(label.opacity === 0, `Label opacity should be 0 after first animation, actual value is ${label.opacity}.`);

			return animation2.play();
		})
		.then(() => {
			TKUnit.assert(label.opacity === 1, `Label opacity should be 1 after second animation, actual value is ${label.opacity}.`);
			done();
		})
		.catch((e) => {
			console.log(e.message);
			done(e);
		});
}

export function test_PlayPromiseIsResolvedWhenAnimationFinishes(done) {
	let label = prepareTest();

	var animation = label.createAnimation({ opacity: 0, duration: 5 });

	animation.play().then(
		function onResolved() {
			TKUnit.assert(animation.isPlaying === false, 'Animation.isPlaying should be false when animation play promise is resolved.');
			done();
		},
		function onRejected(e) {
			TKUnit.assert(false, 'Animation play promise should be resolved, not rejected.');
			done(e);
		}
	);
}

export function test_PlayPromiseIsRejectedWhenAnimationIsCancelled(done) {
	let label = prepareTest();

	var animation = label.createAnimation({ opacity: 0, duration: 5 });

	animation.play().then(
		function onResolved() {
			TKUnit.assert(false, 'Animation play promise should be rejected, not resolved.');
			done();
		},
		function onRejected(e) {
			TKUnit.assert(animation.isPlaying === false, 'Animation.isPlaying should be false when animation play promise is rejected.');
			done();
		}
	);

	animation.cancel();
}

function assertIOSNativeTransformIsCorrect(view: viewModule.View) {
	if (view.ios) {
		var errorMessage = (<any>animation)._getTransformMismatchErrorMessage(view);
		if (errorMessage) {
			TKUnit.assert(false, errorMessage);
		}
	}
}

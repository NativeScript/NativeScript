import { Observable, EventData, Page, CoreTypes, GlassEffectConfig, View, GlassEffectType, TouchAnimationOptions, Label, Image } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new GlassEffectModel();
}

const originalTransform = Symbol('originalTransform');

export class GlassEffectModel extends Observable {
	iosGlassEffectInteractive: GlassEffectConfig = {
		interactive: true,
		tint: '#faabab',
		variant: 'clear',
	};
	currentEffect: GlassEffectConfig = {
		variant: 'none',
		interactive: false,
		// tint: '#ccc',
	};

	toggleGlassEffect(args) {
		const btn = args.object as View;
		this.currentEffect =
			this.currentEffect.variant === 'none'
				? {
						variant: 'clear',
						interactive: true,
						// tint: '#faabab',
					}
				: {
						variant: 'none',
						interactive: false,
						// tint: '#ccc',
					};
		btn.iosGlassEffect = this.currentEffect;
	}

	images = ['res://bg1.jpg', 'res://bg2.jpg', 'res://bg3.jpg'];
	currentImage = this.images[0];
	cycleImage() {
		if (!this.image) {
			return;
		}
		let currentIndex = this.images.indexOf(this.currentImage);
		currentIndex++;
		if (currentIndex === this.images.length) {
			currentIndex = 0;
		}
		this.currentImage = this.images[currentIndex];
		// this.notifyPropertyChange('currentImage', this.currentImage);
		this.image.animate({ opacity: 0, duration: 300, curve: CoreTypes.AnimationCurve.easeInOut }).then(() => {
			this.image.src = this.currentImage;
			setTimeout(() => {
				this.image.animate({ opacity: 1, duration: 800, curve: CoreTypes.AnimationCurve.easeInOut });
			});
		});
	}

	image: Image;
	loadedImage(args) {
		this.image = args.object as Image;
	}

	glassMerged = false;
	glassTargets = {};
	loadedGlass(args) {
		const glass = args.object as View;
		switch (glass.id) {
			case 'glass1':
				glass.translateX = -40;
				break;
			case 'glass2':
				glass.translateX = 40;

				break;
		}
		this.glassTargets[glass.id] = glass;
	}

	glassTargetLabels: { [key: string]: Label } = {};
	loadedGlassLabels(args) {
		const label = args.object as Label;
		this.glassTargetLabels[label.id] = label;
	}

	toggleMergeGlass() {
		if (!this.glassTargets['glass1'] || !this.glassTargets['glass2']) {
			return;
		}
		this.glassMerged = !this.glassMerged;
		const glass1 = this.glassTargets['glass1'];
		const glass2 = this.glassTargets['glass2'];
		glass1.animate({ translate: { x: this.glassMerged ? -40 : 0, y: 0 }, duration: 300, curve: CoreTypes.AnimationCurve.easeInOut }).catch(() => {});
		glass2.animate({ translate: { x: this.glassMerged ? 40 : 0, y: 0 }, duration: 300, curve: CoreTypes.AnimationCurve.easeInOut }).catch(() => {});

		this.glassTargetLabels['share'].animate({ opacity: this.glassMerged ? 1 : 0, duration: 300, curve: CoreTypes.AnimationCurve.easeInOut }).catch(() => {});

		this.glassTargetLabels['like'].text = this.glassMerged ? 'Done' : 'Like';
	}

	touchAnimation: TouchAnimationOptions = {
		down: (view: View) => {
			if (__APPLE__) {
				UIView.animateWithDurationDelayUsingSpringWithDampingInitialSpringVelocityOptionsAnimationsCompletion(
					0.3,
					0,
					0.5,
					3,
					UIViewAnimationOptions.CurveEaseInOut | UIViewAnimationOptions.AllowUserInteraction,
					() => {
						if (view?.ios) {
							view[originalTransform] = view[originalTransform] ?? view.ios.transform;

							view.ios.transform = CGAffineTransformConcat(view[originalTransform], CGAffineTransformMakeScale(0.97, 0.97));
						}
					},
					null,
				);
			} else {
				view
					?.animate({
						scale: { x: 0.97, y: 0.97 },
						duration: 120,
						curve: CoreTypes.AnimationCurve.easeInOut,
					})
					.then(() => {})
					.catch(() => {});
			}
		},
		up: (view: View) => {
			if (__APPLE__) {
				UIView.animateWithDurationDelayUsingSpringWithDampingInitialSpringVelocityOptionsAnimationsCompletion(
					0.3,
					0,
					0.5,
					3,
					UIViewAnimationOptions.CurveEaseInOut | UIViewAnimationOptions.AllowUserInteraction,
					() => {
						if (view?.ios) {
							view.ios.transform = view[originalTransform] ?? CGAffineTransformMakeScale(1, 1);
						}
					},
					null,
				);
			} else {
				view
					?.animate({
						scale: { x: 1, y: 1 },
						duration: 120,
						curve: CoreTypes.AnimationCurve.easeInOut,
					})
					.then(() => {})
					.catch(() => {});
			}
		},
	};
}

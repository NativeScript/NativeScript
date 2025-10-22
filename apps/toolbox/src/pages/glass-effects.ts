import { Observable, EventData, Page, CoreTypes, GlassEffectConfig, View, Label, Animation, LiquidGlassContainer } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new GlassEffectModel();
}

export class GlassEffectModel extends Observable {
	iosGlassEffectInteractive: GlassEffectConfig = {
		interactive: true,
		// tint: '#faabab',
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

	glassMerged = false;
	glassTargets = {};
	loadedGlass(args) {
		const glass = args.object as View;
		switch (glass.id) {
			case 'glass1':
				glass.translateX = 10;
				break;
			case 'glass2':
				glass.translateX = 70;

				break;
		}
		this.glassTargets[glass.id] = glass;
	}

	glassTargetLabels: { [key: string]: Label } = {};
	loadedGlassLabels(args) {
		const label = args.object as Label;
		this.glassTargetLabels[label.id] = label;
	}

	async toggleMergeGlass(args) {
		if (!this.glassTargets['glass1'] || !this.glassTargets['glass2']) {
			return;
		}
		const container = args?.object as LiquidGlassContainer | undefined;
		this.glassMerged = !this.glassMerged;
		const glass1 = this.glassTargets['glass1'];
		const glass2 = this.glassTargets['glass2'];

		// Use relative deltas for translate; the container will bake them into frames post-animation
		const d1 = this.glassMerged ? 25 : -25; // left bubble moves inward/outward
		const d2 = this.glassMerged ? -25 : 25; // right bubble moves inward/outward

		if (!this.glassMerged) {
			this.glassTargetLabels['like'].text = 'Like';
		}

		const animateAll = new Animation([
			{ target: glass1, translate: { x: d1, y: 0 }, duration: 300, curve: CoreTypes.AnimationCurve.easeOut },
			{ target: glass2, translate: { x: d2, y: 0 }, duration: 300, curve: CoreTypes.AnimationCurve.easeOut },
			{
				target: this.glassTargetLabels['share'],
				opacity: this.glassMerged ? 0 : 1,
				duration: 300,
			},
		]);
		animateAll.play().then(() => {
			if (this.glassMerged) {
				this.glassTargetLabels['like'].text = 'Done';
			}

			// Ask container to stabilize frames so UIGlassContainerEffect samples correct positions
			setTimeout(() => container?.stabilizeLayout?.(), 0);
		});

		// for testing, on tap, can see glass effect changes animating differences
		// this.testGlassBindingChanges();
	}

	testGlassBindingChanges() {
		setTimeout(() => {
			this.iosGlassEffectInteractive = {
				interactive: false,
				variant: 'regular',
				// can even animate tint changes (requires starting of transparent tint)
				// tint: '#faabab',
			};
			this.notifyPropertyChange('iosGlassEffectInteractive', this.iosGlassEffectInteractive);
			setTimeout(() => {
				this.iosGlassEffectInteractive = {
					interactive: true,
					variant: 'clear',
					// by setting tint to transparent, it will animate on next change
					// tint: '#00000000',
				};
				this.notifyPropertyChange('iosGlassEffectInteractive', this.iosGlassEffectInteractive);
			}, 1500);
		}, 1500);
	}
}

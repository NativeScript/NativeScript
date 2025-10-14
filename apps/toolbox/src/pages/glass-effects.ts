import { Observable, EventData, Page, CoreTypes, GlassEffectConfig, View, GlassEffectType, TouchAnimationOptions, Label, Image } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new GlassEffectModel();
}

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
}

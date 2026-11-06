export * from './animation-common';
export * from './animation-shared';
export * from './animation-types';

import { AnimationBase } from './animation-common';

export function _resolveAnimationCurve(curve: any): any {
	return curve;
}

// TODO(linux): frame-clock driven animations; for now targets are applied at once.
export class Animation extends AnimationBase {
	public play(): any {
		const promise = super.play();
		for (const property of this._propertyAnimations) {
			const target: any = property.target;
			const value: any = property.value;
			switch (property.property) {
				case 'opacity':
					target.opacity = value;
					break;
				case 'backgroundColor':
					target.backgroundColor = value;
					break;
				case 'translate':
					target.translateX = value.x;
					target.translateY = value.y;
					break;
				case 'scale':
					target.scaleX = value.x;
					target.scaleY = value.y;
					break;
				case 'rotate':
					target.rotate = typeof value === 'number' ? value : value.z;
					break;
				case 'width':
					target.width = value;
					break;
				case 'height':
					target.height = value;
					break;
			}
		}
		setTimeout(() => this._resolveAnimationFinishedPromise(), 0);
		return promise;
	}

	public _resolveAnimationCurve(curve: any): any {
		return curve;
	}
}

import { LinearGradient } from '../styling/linear-gradient';

declare module 'globals' {
	export const global: any;
}
declare const global: any;

export function fromGradient(gradient: LinearGradient): org.nativescript.widgets.LinearGradientDefinition {
	const colors = Array.create('int', gradient.colorStops.length);
	const stops = Array.create('float', gradient.colorStops.length);
	let hasStops = false;
	gradient.colorStops.forEach((stop, index) => {
		colors[index] = stop.color.android;
		if (stop.offset) {
			stops[index] = stop.offset.value / 100; // Convert percentage to decimal
			hasStops = true;
		}
	});

	const alpha = gradient.angle / (Math.PI * 2);
	const startX = Math.pow(Math.sin(Math.PI * (alpha + 0.75)), 2);
	const startY = Math.pow(Math.sin(Math.PI * (alpha + 0.5)), 2);
	const endX = Math.pow(Math.sin(Math.PI * (alpha + 0.25)), 2);
	const endY = Math.pow(Math.sin(Math.PI * alpha), 2);

	return new org.nativescript.widgets.LinearGradientDefinition(startX, startY, endX, endY, colors, hasStops ? stops : null);
}

@NativeClass()
class ShaderDrawable extends android.graphics.drawable.ShapeDrawable {
	private gradient: org.nativescript.widgets.LinearGradientDefinition;
	private paint: android.graphics.Paint;

	constructor(gradient: org.nativescript.widgets.LinearGradientDefinition) {
		super(new android.graphics.drawable.shapes.RectShape());
		this.gradient = gradient;
		this.paint = this.getPaint();
		return global.__native(this);
	}

	public onBoundsChange(bounds: android.graphics.Rect): void {
		super.onBoundsChange(bounds);
		this.updateShader(bounds);
	}

	private updateShader(bounds: android.graphics.Rect): void {
		const width = bounds.width();
		const height = bounds.height();

		if (width <= 0 || height <= 0) {
			return;
		}

		const shader = new android.graphics.LinearGradient(this.gradient.getStartX() * width, this.gradient.getStartY() * height, this.gradient.getEndX() * width, this.gradient.getEndY() * height, this.gradient.getColors(), this.gradient.getStops(), android.graphics.Shader.TileMode.CLAMP);

		this.paint.setShader(shader);
		this.invalidateSelf();
	}
}

@NativeClass()
export class GradientDrawable extends android.graphics.drawable.LayerDrawable {
	constructor(gradient: LinearGradient, defaultDrawable: android.graphics.drawable.LayerDrawable) {
		const drawableCount = defaultDrawable.getNumberOfLayers();
		const drawables = Array.create('android.graphics.drawable.Drawable', drawableCount);
		const shaderDrawable = new ShaderDrawable(fromGradient(gradient));

		for (let i = 0; i < drawableCount; i++) {
			const id = defaultDrawable.getId(i);
			if (id === android.R.id.progress) {
				drawables[i] = shaderDrawable;
			} else {
				drawables[i] = defaultDrawable.getDrawable(i);
			}
		}

		super(drawables);

		// Copy layer IDs from original drawable
		for (let i = 0; i < drawableCount; i++) {
			this.setId(i, defaultDrawable.getId(i));
		}

		return global.__native(this);
	}
}

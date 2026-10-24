import type { Frame, FrameBackPreview, FrameBackPreviewOptions } from '.';

const MAX_PIXELS = 4 * 1024 * 1024;

function containsSurface(view: android.view.View): boolean {
	if (view instanceof android.view.SurfaceView || view instanceof android.view.TextureView) return true;
	if (view instanceof android.view.ViewGroup) {
		for (let i = 0; i < view.getChildCount(); i++) {
			if (containsSurface(view.getChildAt(i))) return true;
		}
	}
	return false;
}

export function createBackPreview(frame: Frame, options: FrameBackPreviewOptions): FrameBackPreview | undefined {
	let top = frame.currentPage?.nativeViewProtected as android.view.View;
	const below = frame.backStack.at(-1)?.resolvedPage.nativeViewProtected as android.view.View;
	let container = frame.nativeViewProtected as android.view.ViewGroup;
	if (!top || !below || !container || below.getParent() || top.getParent() !== container) return;
	const width = below.getWidth();
	const height = below.getHeight();
	if (width <= 0 || height <= 0 || width * height > MAX_PIXELS || containsSurface(below)) return;
	const window = frame.android.activity?.getWindow();
	if (!window || (window.getAttributes().flags & android.view.WindowManager.LayoutParams.FLAG_SECURE) !== 0) return;

	let bitmap: android.graphics.Bitmap;
	let image: android.widget.ImageView;
	try {
		bitmap = android.graphics.Bitmap.createBitmap(width, height, android.graphics.Bitmap.Config.ARGB_8888);
		below.draw(new android.graphics.Canvas(bitmap));
		image = new android.widget.ImageView(container.getContext());
		image.setImageBitmap(bitmap);
		image.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS);
		image.setClickable(false);
		image.setFocusable(false);
		container.addView(image, 0, new org.nativescript.widgets.CommonLayoutParams());
		image.measure(android.view.View.MeasureSpec.makeMeasureSpec(width, android.view.View.MeasureSpec.EXACTLY), android.view.View.MeasureSpec.makeMeasureSpec(height, android.view.View.MeasureSpec.EXACTLY));
		image.layout(below.getLeft(), below.getTop(), below.getLeft() + width, below.getTop() + height);
	} catch {
		if (image?.getParent() === container) container.removeView(image);
		image?.setImageDrawable(null);
		bitmap?.recycle();
		return;
	}

	const saved = { x: top.getTranslationX(), scaleX: top.getScaleX(), scaleY: top.getScaleY(), alpha: top.getAlpha(), elevation: top.getElevation(), background: top.getBackground() };
	if (!saved.background) {
		const color = new android.util.TypedValue();
		const found = container.getContext().getTheme().resolveAttribute(android.R.attr.colorBackground, color, true);
		top.setBackground(new android.graphics.drawable.ColorDrawable(found ? color.data : -1));
	}
	top.setElevation(saved.elevation + 8 * container.getResources().getDisplayMetrics().density);
	let phase: 'dragging' | 'finishing' | 'finished' | 'cancelling' | 'disposed' = 'dragging';
	let direction = 1;
	let resolveFinish: (completed: boolean) => void;
	let finishPromise: Promise<boolean>;
	const frameWidth = container.getWidth();
	const dispose = () => {
		if (phase === 'disposed') return;
		phase = 'disposed';
		top.animate().cancel();
		image.animate().cancel();
		top.setTranslationX(saved.x);
		top.setScaleX(saved.scaleX);
		top.setScaleY(saved.scaleY);
		top.setAlpha(saved.alpha);
		top.setElevation(saved.elevation);
		top.setBackground(saved.background);
		if (image.getParent() === container) container.removeView(image);
		image.setImageDrawable(null);
		// RenderThread can still hold the bitmap from the previous frame.
		bitmap = null;
		resolveFinish?.(false);
		resolveFinish = undefined;
		const onDispose = options.onDispose;
		options = {};
		top = null;
		image = null;
		container = null;
		saved.background = null;
		onDispose?.();
	};
	return {
		version: 1,
		get active() {
			return phase !== 'disposed';
		},
		get snapshotBytes() {
			return bitmap?.getAllocationByteCount() ?? 0;
		},
		update(progress, edge) {
			if (phase !== 'dragging' || !Number.isFinite(progress)) return;
			direction = edge === 'right' ? -1 : 1;
			const value = Math.max(0, Math.min(1, progress));
			top.setScaleX(saved.scaleX * (1 - 0.1 * value));
			top.setScaleY(saved.scaleY * (1 - 0.1 * value));
			top.setTranslationX(saved.x + direction * 0.05 * frameWidth * value);
			image.setTranslationX(-direction * 0.15 * frameWidth * (1 - value));
		},
		cancel() {
			if (phase === 'disposed' || phase === 'cancelling') return;
			phase = 'cancelling';
			top.animate().cancel();
			image.animate().cancel();
			resolveFinish?.(false);
			resolveFinish = undefined;
			top.animate().translationX(saved.x).scaleX(saved.scaleX).scaleY(saved.scaleY).alpha(saved.alpha).setDuration(200);
			image
				.animate()
				.translationX(-direction * 0.15 * frameWidth)
				.setDuration(200)
				.withEndAction(new java.lang.Runnable({ run: dispose }));
		},
		finish() {
			if (phase === 'finished') return Promise.resolve(true);
			if (phase === 'finishing') return finishPromise;
			if (phase !== 'dragging') return Promise.resolve(false);
			phase = 'finishing';
			finishPromise = new Promise((resolve) => {
				resolveFinish = resolve;
			});
			top
				.animate()
				.translationX(saved.x + direction * frameWidth)
				.alpha(0)
				.setDuration(200);
			image
				.animate()
				.translationX(0)
				.setDuration(200)
				.withEndAction(
					new java.lang.Runnable({
						run() {
							if (phase !== 'finishing') return;
							phase = 'finished';
							resolveFinish?.(true);
							resolveFinish = undefined;
						},
					}),
				);
			return finishPromise;
		},
		dispose,
	};
}

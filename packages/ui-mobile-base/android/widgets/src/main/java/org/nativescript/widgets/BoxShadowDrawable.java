package org.nativescript.widgets;

import android.graphics.BlurMaskFilter;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.graphics.Region;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.LayerDrawable;
import android.graphics.drawable.ShapeDrawable;
import android.graphics.drawable.shapes.RectShape;
import android.graphics.drawable.shapes.RoundRectShape;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

import java.util.Arrays;

@RequiresApi(api = Build.VERSION_CODES.M)
public class BoxShadowDrawable extends LayerDrawable {
	// Static parameters
	protected final static String TAG = "BoxShadowDrawable";

	private final Drawable _wrappedDrawable;
	private final int[] _values;
	private final float[] _cornerRadii;
	private final Path _clipPath = new Path();
	private final RectF _clipRect = new RectF();

	// Use this multiplier to imitate CSS shadow blur
	private final float _shadowBlurMultiplier = (float)Math.sqrt(3) / 2;

	public BoxShadowDrawable(Drawable wrappedDrawable, int[] values) {
		super(new Drawable[]{});

		this._values = values;
		this._wrappedDrawable = wrappedDrawable;
		this._cornerRadii = this._calculateCornerRadii();

		// Add our shadow layers
		this._renderShadowLayers(values);

		if (this._wrappedDrawable != null) {
			this.addLayer(this._wrappedDrawable);
		}
	}

	// to allow applying any bg changes on original Drawable
	public Drawable getWrappedDrawable() {
		return this._wrappedDrawable;
	}

	@Override
	public void draw(Canvas canvas) {
		final int layerCount = this.getNumberOfLayers();

		_clipRect.set(getBounds());
		_clipPath.reset();

		if (this._cornerRadii != null) {
			_clipPath.addRoundRect(_clipRect, this._cornerRadii, Path.Direction.CW);
		} else {
			_clipPath.addRect(_clipRect, Path.Direction.CW);
		}

		canvas.save();

		// Clip inner area to match browser shadows in case background is transparent
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
			canvas.clipOutPath(_clipPath);
		} else {
			canvas.clipPath(_clipPath, Region.Op.DIFFERENCE);
		}

		for (int i = 0; i < layerCount; i++) {
			Drawable layerDrawable = this.getDrawable(i);
			if (layerDrawable != null && layerDrawable != this._wrappedDrawable) {
				layerDrawable.draw(canvas);
			}
		}

		canvas.restore();

		if (_wrappedDrawable != null) {
			_wrappedDrawable.draw(canvas);
		}
	}

	private float[] _calculateCornerRadii() {
		float[] radii;

		// if we are wrapping a BorderDrawable - we can get the radii from it
		if (this._wrappedDrawable != null && this._wrappedDrawable instanceof BorderDrawable) {
			BorderDrawable b = (BorderDrawable) this._wrappedDrawable;
			radii = new float[]{
				b.getBorderTopLeftRadius(),
				b.getBorderTopLeftRadius(),

				b.getBorderTopRightRadius(),
				b.getBorderTopRightRadius(),

				b.getBorderBottomRightRadius(),
				b.getBorderBottomRightRadius(),

				b.getBorderBottomLeftRadius(),
				b.getBorderBottomLeftRadius(),
			};
		} else {
			radii = null;
		}

		return radii;
	}

	private void _renderShadowLayers(int[] values) {
		try {
			for (int i = 0; i < values.length; i += 6) {
				int shadowColor = values[i];
				int spreadRadius = values[i + 1];
				int blurRadius = values[i + 2];
				int offsetX = values[i + 3];
				int offsetY = values[i + 4];
				// TODO: Use inset when inner shadows get implemented
				//boolean inset = values[i + 5] == 1;

				RectShape shape = this._cornerRadii != null ? new RoundRectShape(this._cornerRadii, null, null) : new RectShape();
				ShapeDrawable shadowLayer = new ShapeDrawable(shape);

				// Apply boxShadow
				shadowLayer.getPaint().setColor(shadowColor);
				if (blurRadius > 0) {
					shadowLayer.getPaint().setMaskFilter(new BlurMaskFilter(blurRadius * _shadowBlurMultiplier, BlurMaskFilter.Blur.NORMAL));
				} else {
					shadowLayer.getPaint().setStyle(Paint.Style.FILL);
				}
				shadowLayer.getPaint().setAntiAlias(true);

				// apply insets that mimic offsets/spread to the shadowLayer
				int inset = -spreadRadius;
				Log.d(TAG, "Insets:"
					+ "\n l: " + (inset + offsetX)
					+ "\n t: " + (inset + offsetY)
					+ "\n r: " + (inset - offsetX)
					+ "\n b: " + (inset - offsetY)
				);

				int layerIndex = this.addLayer(shadowLayer);
				this.setLayerInset(layerIndex,
					inset + offsetX,
					inset + offsetY,
					inset - offsetX,
					inset - offsetY
				);
			}
		} catch (Exception e) {
			Log.e(TAG, "Failed to parse CSS box-shadow values: " + this);
			e.printStackTrace();
		}
	}

	@NonNull
	@Override
	public String toString() {
		return "BoxShadowDrawable " + Arrays.toString(this._values);
	}
}

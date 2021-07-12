package org.nativescript.widgets;

import android.graphics.BlurMaskFilter;
import android.graphics.Color;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.LayerDrawable;
import android.graphics.drawable.ShapeDrawable;
import android.graphics.drawable.shapes.RectShape;
import android.graphics.drawable.shapes.RoundRectShape;
import android.os.Build;
import android.util.Log;

import androidx.annotation.RequiresApi;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Arrays;

@RequiresApi(api = Build.VERSION_CODES.M)
public class BoxShadowDrawable extends LayerDrawable {
	// Static parameters
	protected final static int DEFAULT_BACKGROUND_COLOR = Color.WHITE;
	protected final static String TAG = "BoxShadowDrawable";

	// BoxShadow Parameters
	protected int offsetX = 0;
	protected int offsetY = 0;
	protected int blurRadius = 0;
	protected int spreadRadius = 0;
	protected int shadowColor = Color.BLACK;

	// Layers
	protected final ShapeDrawable shadowLayer;
	protected final ShapeDrawable overlayLayer;
	protected final Drawable wrappedLayer;

	protected float[] currentCornerRadii;

	public BoxShadowDrawable(Drawable wrappedDrawable, String value)  {
		super(new Drawable[]{});

		Log.d(TAG, "Constructing BoxShadowDrawable!");

		this.shadowLayer = new ShapeDrawable(new RectShape());
		this.overlayLayer = this.createOverlayLayer();
		this.wrappedLayer = wrappedDrawable;

		// add our layers
		this.addLayer(shadowLayer);
		this.addLayer(overlayLayer);
		this.addLayer(wrappedLayer);

		this.setValue(value);
	}

	// to allow applying any bg changes on original Drawable
	public Drawable getWrappedDrawable() {
		return this.wrappedLayer;
	}

	public void setValue(String value) {
		try {
			JSONObject config = new JSONObject(value);
			offsetX = config.getInt("offsetX");
			offsetY = config.getInt("offsetY");
			blurRadius = config.getInt("blurRadius");
			spreadRadius = config.getInt("spreadRadius");
			shadowColor = config.getInt("shadowColor");

			float[] outerRadius;

			// if we are wrapping a BorderDrawable - we can get the radii from it
			if(wrappedLayer instanceof BorderDrawable) {
				BorderDrawable b = (BorderDrawable) wrappedLayer;
				outerRadius = new float[]{
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
				int cornerRadius = 0;
				try {
					cornerRadius = config.getInt("cornerRadius");
				} catch (JSONException ignore) {}

				outerRadius = new float[8];
				Arrays.fill(outerRadius, cornerRadius);
			}

			if(!Arrays.equals(outerRadius, currentCornerRadii)) {
				Log.d(TAG, "Update layer shape");
				shadowLayer.setShape(new RoundRectShape(outerRadius, null, null));
				overlayLayer.setShape(new RoundRectShape(outerRadius, null, null));

				// update current
				currentCornerRadii = outerRadius;
			}

			// apply new shadow parameters
			this.applyShadow();
		} catch (JSONException exception) {
			Log.d(TAG, "Caught JSONException...");
			exception.printStackTrace();
		}
	}

	private void applyShadow() {
		Log.d(TAG, "applyShadow: " + this);

		// apply boxShadow
		shadowLayer.getPaint().setColor(shadowColor);
		shadowLayer.getPaint().setMaskFilter(new BlurMaskFilter(
			Float.MIN_VALUE + blurRadius,
			BlurMaskFilter.Blur.NORMAL
		));
		shadowLayer.getPaint().setAntiAlias(true);

		// apply insets that mimic offsets/spread to the shadowLayer
		int inset = -spreadRadius;
		Log.d(TAG, "Insets:"
			+ "\n l: " + (inset + offsetX)
			+ "\n t: " + (inset + offsetY)
			+ "\n r: " + (inset - offsetX)
			+ "\n b: " + (inset - offsetY)
		);
		this.setLayerInset(0,
			inset + offsetX,
			inset + offsetY,
			inset - offsetX,
			inset - offsetY
		);
	}

	private ShapeDrawable createOverlayLayer() {
		ShapeDrawable shapeDrawable = new ShapeDrawable(new RectShape());
		shapeDrawable.getPaint().setColor(DEFAULT_BACKGROUND_COLOR);

		return shapeDrawable;
	}

	@Override
	public String toString() {
		return "BoxShadowDrawable { oX:" + offsetX + " oY:" + offsetY + " br:" + blurRadius + " sr:" + spreadRadius + " c:" + shadowColor + " }";
	}
}

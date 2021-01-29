/**
 *
 */
package org.nativescript.widgets;

/**
 * @author triniwiz
 */

import android.graphics.Color;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.LayerDrawable;
import android.graphics.drawable.ShapeDrawable;
import android.graphics.drawable.shapes.RoundRectShape;
import android.view.View;
import android.view.ViewGroup;

import org.json.JSONException;
import org.json.JSONObject;

public class Utils {
	public static void drawBoxShadow(View view, String value) {
		try {
			JSONObject config = new JSONObject(value);
			int shadowColor = config.getInt("shadowColor");
			int cornerRadius = config.getInt("cornerRadius");
			int spreadRadius = config.getInt("spreadRadius");
			int blurRadius = config.getInt("blurRadius");
			int configOffsetX = config.getInt("offsetX");
			int configOffsetY = config.getInt("offsetY");
			int scale = config.getInt("scale");


			float cornerRadiusValue = cornerRadius * scale;

			float shadowSpread = spreadRadius * scale;

			// Set shadow layer
			float[] outerRadius = {cornerRadiusValue, cornerRadiusValue, cornerRadiusValue, cornerRadiusValue, cornerRadiusValue, cornerRadiusValue, cornerRadiusValue, cornerRadiusValue};

			// Default background for transparent/semi-transparent background so it doesn't see through the shadow
			int defaultBackgroundColor = Color.WHITE;
			RoundRectShape backgroundRectShape = new RoundRectShape(outerRadius, null, null);
			ShapeDrawable backgroundDrawable = new ShapeDrawable(backgroundRectShape);
			backgroundDrawable.getPaint().setColor(defaultBackgroundColor);

			// shadow layer setup
			RoundRectShape shadowRectShape = new RoundRectShape(outerRadius, null, null);
			ShapeDrawable shadowShapeDrawable = new ShapeDrawable(shadowRectShape);
			shadowShapeDrawable.getPaint().setShadowLayer(shadowSpread, 0, 0, shadowColor);
			shadowShapeDrawable.getPaint().setAntiAlias(true);

			// set shadow direction
			Drawable[] drawableArray = new Drawable[3];
			drawableArray[0] = shadowShapeDrawable;
			drawableArray[1] = backgroundDrawable;
			drawableArray[2] = view.getBackground();
			LayerDrawable drawable = new LayerDrawable(drawableArray);

			// workaround to show shadow offset (similar to ios's offsets)
			int shadowInsetsLeft;
			int shadowInsetsTop;
			int shadowInsetsRight;
			int shadowInsetsBottom;

			float offsetX = configOffsetX - spreadRadius;
			// ignore the following line, this is similar to the adjustedShadowOffset on ios.
			// it is just used to experiment the amount of insets that need to be applied based
			// on the offset provided. Need to use some real calculation to gain parity (ask Osei)
			float insetScaleFactor = 4f / 5f;

			if (configOffsetX == 0) {
				shadowInsetsLeft = 0;
				shadowInsetsRight = 0;
			} else if (configOffsetX > 0) {
				shadowInsetsLeft = (int) (shadowSpread * insetScaleFactor);
				shadowInsetsRight = (int) ((offsetX < 0 ? 0 : offsetX) * scale * insetScaleFactor);
			} else {
				shadowInsetsLeft = (int) ((offsetX < 0 ? 0 : offsetX) * scale * insetScaleFactor);
				shadowInsetsRight = (int) (shadowSpread * insetScaleFactor);
			}
			float offsetY = configOffsetY - spreadRadius;
			if (configOffsetY == 0) {
				shadowInsetsTop = 0;
				shadowInsetsBottom = 0;
			} else if (configOffsetY >= 0) {
				shadowInsetsTop = (int) (shadowSpread * insetScaleFactor);
				shadowInsetsBottom = (int) ((offsetY < 0 ? 0 : offsetY) * scale * insetScaleFactor);
			} else {
				shadowInsetsTop = (int) ((offsetY < 0 ? 0 : offsetY) * scale * insetScaleFactor);
				shadowInsetsBottom = (int) (shadowSpread * insetScaleFactor);
			}

			// TODO: this isn't really a shadow offset per se, but just having the some layer
			// drawable layer have an inset to mimic an offset (feels very hacky ugh)
			drawable.setLayerInset(0, shadowInsetsLeft, shadowInsetsTop, shadowInsetsRight, shadowInsetsBottom);

			// this is what it shadows look like without offsets - uncomment the following line,
			// and comment out line above to see what the shadow without any inset modification looks like
			// on android
			// drawable.setLayerInset(0, shadowSpread, shadowSpread, shadowSpread, shadowSpread);

			// make sure parent doesn't clip the shadows
			int count = 0;
			View nativeView = view;
			while (view.getParent() != null && view.getParent() instanceof ViewGroup) {
				count++;
				ViewGroup parent = (ViewGroup) view.getParent();
				parent.setClipChildren(false);
				parent.setClipToPadding(false);
				// removing clipping from all breaks the ui
				if (count == 1) {
					break;
				}
				nativeView = parent;
			}

			nativeView.setBackground(drawable);
		} catch (JSONException ignore) {
		}
	}
}

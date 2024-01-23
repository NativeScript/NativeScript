package org.nativescript.widgets;

import android.annotation.TargetApi;
import android.graphics.Outline;
import android.graphics.Path;
import android.graphics.Rect;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewOutlineProvider;
import android.widget.FrameLayout;
import android.widget.TextView;


import androidx.appcompat.widget.AppCompatTextView;

import java.lang.reflect.Field;
import java.lang.Class;

/**
 * Created by hhristov on 8/23/16.
 */

public class ViewHelper {
	private ViewHelper() {

	}

	static final int version = android.os.Build.VERSION.SDK_INT;
	static final boolean LOLLIPOP = android.os.Build.VERSION.SDK_INT >= 21;
	static final boolean PI = android.os.Build.VERSION.SDK_INT >= 28;
	static final boolean TIRAMISU = android.os.Build.VERSION.SDK_INT >= 33;

	public static int getMinWidth(android.view.View view) {
		return view.getMinimumWidth();
	}

	public static void setMinWidth(android.view.View view, int value) {
		if (view instanceof TextView) {
			((android.widget.TextView) view).setMinWidth(value);
		}

		view.setMinimumWidth(value);
	}

	public static int getMinHeight(android.view.View view) {
		return view.getMinimumHeight();
	}

	public static void setMinHeight(android.view.View view, int value) {
		if (view instanceof TextView) {
			((android.widget.TextView) view).setMinHeight(value);
		}

		view.setMinimumHeight(value);
	}

	public static int getWidth(android.view.View view) {
		ViewGroup.LayoutParams params = view.getLayoutParams();
		if (params != null) {
			return params.width;
		}

		return ViewGroup.LayoutParams.MATCH_PARENT;
	}

	public static void setWidth(android.view.View view, int value) {
		ViewGroup.LayoutParams params = view.getLayoutParams();
		if (params == null) {
			params = new CommonLayoutParams();
		}

		params.width = value;
		if (params instanceof CommonLayoutParams) {
			((CommonLayoutParams) params).widthPercent = -1;
		}

		view.setLayoutParams(params);
	}

	public static void setWidthPercent(android.view.View view, float value) {
		ViewGroup.LayoutParams params = view.getLayoutParams();
		if (params == null) {
			params = new CommonLayoutParams();
		}

		if (params instanceof CommonLayoutParams) {
			CommonLayoutParams lp = (CommonLayoutParams) params;
			lp.widthPercent = value;
			lp.width = (lp.gravity & Gravity.HORIZONTAL_GRAVITY_MASK) == Gravity.FILL_HORIZONTAL
				? ViewGroup.LayoutParams.MATCH_PARENT
				: ViewGroup.LayoutParams.WRAP_CONTENT;
			view.setLayoutParams(params);
		}
	}

	public static int getHeight(android.view.View view) {
		ViewGroup.LayoutParams params = view.getLayoutParams();
		if (params != null) {
			return params.height;
		}

		return ViewGroup.LayoutParams.MATCH_PARENT;
	}

	public static void setHeight(android.view.View view, int value) {
		ViewGroup.LayoutParams params = view.getLayoutParams();
		if (params == null) {
			params = new CommonLayoutParams();
		}

		params.height = value;
		if (params instanceof CommonLayoutParams) {
			((CommonLayoutParams) params).heightPercent = -1;
		}

		view.setLayoutParams(params);
	}

	public static void setHeightPercent(android.view.View view, float value) {
		ViewGroup.LayoutParams params = view.getLayoutParams();
		if (params == null) {
			params = new CommonLayoutParams();
		}

		if (params instanceof CommonLayoutParams) {
			CommonLayoutParams lp = (CommonLayoutParams) params;
			lp.heightPercent = value;
			lp.height = (lp.gravity & Gravity.VERTICAL_GRAVITY_MASK) == Gravity.FILL_VERTICAL
				? ViewGroup.LayoutParams.MATCH_PARENT
				: ViewGroup.LayoutParams.WRAP_CONTENT;
			view.setLayoutParams(params);
		}
	}

	public static Rect getMargin(android.view.View view) {
		ViewGroup.LayoutParams params = view.getLayoutParams();
		if (params instanceof ViewGroup.MarginLayoutParams) {
			ViewGroup.MarginLayoutParams lp = (ViewGroup.MarginLayoutParams) params;
			return new Rect(lp.leftMargin, lp.topMargin, lp.rightMargin, lp.bottomMargin);
		}

		return new Rect();
	}

	public static void setMargin(android.view.View view, int left, int top, int right, int bottom) {
		ViewGroup.LayoutParams params = view.getLayoutParams();
		// Initialize if empty.
		if (params == null) {
			params = new CommonLayoutParams();
		}

		// Set margins only if params are of the correct type.
		if (params instanceof ViewGroup.MarginLayoutParams) {
			ViewGroup.MarginLayoutParams lp = (ViewGroup.MarginLayoutParams) params;
			lp.leftMargin = left;
			lp.topMargin = top;
			lp.rightMargin = right;
			lp.bottomMargin = bottom;
			view.setLayoutParams(params);
		}
	}

	public static int getMarginLeft(android.view.View view) {
		ViewGroup.LayoutParams params = view.getLayoutParams();
		if (params instanceof ViewGroup.MarginLayoutParams) {
			ViewGroup.MarginLayoutParams lp = (ViewGroup.MarginLayoutParams) params;
			return lp.leftMargin;
		}

		return 0;
	}

	public static void setMarginLeft(android.view.View view, int value) {
		ViewGroup.LayoutParams params = view.getLayoutParams();
		// Initialize if empty.
		if (params == null) {
			params = new CommonLayoutParams();
		}

		// Set margins only if params are of the correct type.
		if (params instanceof ViewGroup.MarginLayoutParams) {
			ViewGroup.MarginLayoutParams lp = (ViewGroup.MarginLayoutParams) params;
			lp.leftMargin = value;
			view.setLayoutParams(params);
		}

		if (params instanceof CommonLayoutParams) {
			CommonLayoutParams lp = (CommonLayoutParams) params;
			lp.leftMarginPercent = -1;
			view.setLayoutParams(params);
		}
	}

	public static void setMarginLeftPercent(android.view.View view, float value) {
		ViewGroup.LayoutParams params = view.getLayoutParams();
		if (params == null) {
			params = new CommonLayoutParams();
		}

		if (params instanceof CommonLayoutParams) {
			CommonLayoutParams lp = (CommonLayoutParams) params;
			lp.leftMargin = 0;
			lp.leftMarginPercent = value;
			view.setLayoutParams(params);
		}
	}

	public static int getMarginTop(android.view.View view) {
		ViewGroup.LayoutParams params = view.getLayoutParams();
		if (params instanceof ViewGroup.MarginLayoutParams) {
			ViewGroup.MarginLayoutParams lp = (ViewGroup.MarginLayoutParams) params;
			return lp.topMargin;
		}

		return 0;
	}

	public static void setMarginTop(android.view.View view, int value) {
		ViewGroup.LayoutParams params = view.getLayoutParams();
		// Initialize if empty.
		if (params == null) {
			params = new CommonLayoutParams();
		}

		// Set margins only if params are of the correct type.
		if (params instanceof ViewGroup.MarginLayoutParams) {
			ViewGroup.MarginLayoutParams lp = (ViewGroup.MarginLayoutParams) params;
			lp.topMargin = value;
			view.setLayoutParams(params);
		}

		if (params instanceof CommonLayoutParams) {
			CommonLayoutParams lp = (CommonLayoutParams) params;
			lp.topMarginPercent = -1;
			view.setLayoutParams(params);
		}
	}

	public static void setMarginTopPercent(android.view.View view, float value) {
		ViewGroup.LayoutParams params = view.getLayoutParams();
		if (params == null) {
			params = new CommonLayoutParams();
		}

		if (params instanceof CommonLayoutParams) {
			CommonLayoutParams lp = (CommonLayoutParams) params;
			lp.topMargin = 0;
			lp.topMarginPercent = value;
			view.setLayoutParams(params);
		}
	}

	public static int getMarginRight(android.view.View view) {
		ViewGroup.LayoutParams params = view.getLayoutParams();
		if (params instanceof ViewGroup.MarginLayoutParams) {
			ViewGroup.MarginLayoutParams lp = (ViewGroup.MarginLayoutParams) params;
			return lp.rightMargin;
		}

		return 0;
	}

	public static void setMarginRight(android.view.View view, int value) {
		ViewGroup.LayoutParams params = view.getLayoutParams();
		// Initialize if empty.
		if (params == null) {
			params = new CommonLayoutParams();
		}

		// Set margins only if params are of the correct type.
		if (params instanceof ViewGroup.MarginLayoutParams) {
			ViewGroup.MarginLayoutParams lp = (ViewGroup.MarginLayoutParams) params;
			lp.rightMargin = value;
			view.setLayoutParams(params);
		}

		if (params instanceof CommonLayoutParams) {
			CommonLayoutParams lp = (CommonLayoutParams) params;
			lp.rightMarginPercent = -1;
			view.setLayoutParams(params);
		}
	}

	public static void setMarginRightPercent(android.view.View view, float value) {
		ViewGroup.LayoutParams params = view.getLayoutParams();
		if (params == null) {
			params = new CommonLayoutParams();
		}

		if (params instanceof CommonLayoutParams) {
			CommonLayoutParams lp = (CommonLayoutParams) params;
			lp.rightMargin = 0;
			lp.rightMarginPercent = value;
			view.setLayoutParams(params);
		}
	}

	public static int getMarginBottom(android.view.View view) {
		ViewGroup.LayoutParams params = view.getLayoutParams();
		if (params instanceof ViewGroup.MarginLayoutParams) {
			ViewGroup.MarginLayoutParams lp = (ViewGroup.MarginLayoutParams) params;
			return lp.bottomMargin;
		}

		return 0;
	}

	public static void setMarginBottom(android.view.View view, int value) {
		ViewGroup.LayoutParams params = view.getLayoutParams();
		// Initialize if empty.
		if (params == null) {
			params = new CommonLayoutParams();
		}

		// Set margins only if params are of the correct type.
		if (params instanceof ViewGroup.MarginLayoutParams) {
			ViewGroup.MarginLayoutParams lp = (ViewGroup.MarginLayoutParams) params;
			lp.bottomMargin = value;
			view.setLayoutParams(params);
		}

		if (params instanceof CommonLayoutParams) {
			CommonLayoutParams lp = (CommonLayoutParams) params;
			lp.bottomMarginPercent = -1;
			view.setLayoutParams(params);
		}
	}

	public static void setMarginBottomPercent(android.view.View view, float value) {
		ViewGroup.LayoutParams params = view.getLayoutParams();
		if (params == null) {
			params = new CommonLayoutParams();
		}

		if (params instanceof CommonLayoutParams) {
			CommonLayoutParams lp = (CommonLayoutParams) params;
			lp.bottomMargin = 0;
			lp.bottomMarginPercent = value;
			view.setLayoutParams(params);
		}
	}

	public static String getHorizontalAlignment(android.view.View view) {
		ViewGroup.LayoutParams params = view.getLayoutParams();
		if (params instanceof FrameLayout.LayoutParams) {
			FrameLayout.LayoutParams lp = (FrameLayout.LayoutParams) params;
			if (Gravity.isHorizontal(lp.gravity)) {
				switch (lp.gravity & Gravity.HORIZONTAL_GRAVITY_MASK) {
					case Gravity.LEFT:
						return "left";
					case Gravity.CENTER:
						return "center";
					case Gravity.RIGHT:
						return "right";
					case Gravity.FILL_HORIZONTAL:
						return "stretch";

				}
			}
		}

		return "stretch";
	}

	private static Field getField(Class clazz, String field) {
		Field result = null;
		try {
			result = clazz.getDeclaredField(field);
		} catch (Throwable e) {}
		if (result != null) {
			return result;
		}
		while((clazz = clazz.getSuperclass()) != null) {
			try {
				result = clazz.getDeclaredField(field);
			} catch (Throwable e) {}
			if (result != null) {
				return result;
			}
		}
		return result;
	}

	public static void setHorizontalAlignment(android.view.View view, String value) throws Throwable {
		ViewGroup.LayoutParams params = view.getLayoutParams();
		// Initialize if empty.
		if (params == null) {
			params = new CommonLayoutParams();
		}

		Field field = getField(params.getClass(), "gravity");
		if (field != null) {
			int gravity = field.getInt(params);
			Field weightField = getField(params.getClass(), "weight");
			switch (value) {
				case "left":
					gravity = Gravity.LEFT | (gravity & Gravity.VERTICAL_GRAVITY_MASK);
					if (weightField != null && weightField.getFloat(params) < 0) {
						weightField.setFloat(params, -2.0f);
					}
					break;
				case "center":
				case "middle":
					gravity = Gravity.CENTER_HORIZONTAL | (gravity & Gravity.VERTICAL_GRAVITY_MASK);
					if (weightField != null && weightField.getFloat(params) < 0) {
						weightField.setFloat(params, -2.0f);
					}
					break;
				case "right":
					gravity = Gravity.RIGHT | (gravity & Gravity.VERTICAL_GRAVITY_MASK);
					if (weightField != null && weightField.getFloat(params) < 0) {
						weightField.setFloat(params, -2.0f);
					}
					break;
				case "stretch":
					gravity = Gravity.FILL_HORIZONTAL | (gravity & Gravity.VERTICAL_GRAVITY_MASK);
					if (weightField != null && weightField.getFloat(params) < 0) {
						weightField.setFloat(params, -1.0f);
					}
					break;
			}
			field.setInt(params, gravity);
			view.setLayoutParams(params);
		}
	}

	public static String getVerticalAlignment(android.view.View view) {
		ViewGroup.LayoutParams params = view.getLayoutParams();
		if (params instanceof FrameLayout.LayoutParams) {
			FrameLayout.LayoutParams lp = (FrameLayout.LayoutParams) params;
			if (Gravity.isHorizontal(lp.gravity)) {
				switch (lp.gravity & Gravity.VERTICAL_GRAVITY_MASK) {
					case Gravity.TOP:
						return "top";
					case Gravity.CENTER:
						return "center";
					case Gravity.BOTTOM:
						return "bottom";
					case Gravity.FILL_VERTICAL:
						return "stretch";

				}
			}
		}

		return "stretch";
	}

	public static void setVerticalAlignment(android.view.View view, String value) throws Throwable{
		ViewGroup.LayoutParams params = view.getLayoutParams();
		// Initialize if empty.
		if (params == null) {
			params = new CommonLayoutParams();
		}

		Field field = getField(params.getClass(), "gravity");
		if (field != null) {
			int gravity = field.getInt(params);
			switch (value) {
				case "top":
					gravity = Gravity.TOP | (gravity & Gravity.HORIZONTAL_GRAVITY_MASK);
					if (params.height < 0) {
						params.height = -2;
					}
					break;
				case "center":
				case "middle":
					gravity = Gravity.CENTER_VERTICAL | (gravity & Gravity.HORIZONTAL_GRAVITY_MASK);
					if (params.height < 0) {
						params.height = -2;
					}
					break;
				case "bottom":
					gravity = Gravity.BOTTOM | (gravity & Gravity.HORIZONTAL_GRAVITY_MASK);
					if (params.height < 0) {
						params.height = -2;
					}
					break;
				case "stretch":
					gravity = Gravity.FILL_VERTICAL | (gravity & Gravity.HORIZONTAL_GRAVITY_MASK);
					if (params.height < 0) {
						params.height = -1;
					}
					break;
			}
			field.setInt(params, gravity);
			view.setLayoutParams(params);
		}
	}

	public static Rect getPadding(android.view.View view) {
		return new Rect(view.getPaddingLeft(), view.getPaddingTop(), view.getPaddingRight(), view.getPaddingBottom());
	}

	public static void setPadding(android.view.View view, int left, int top, int right, int bottom) {
		view.setPadding(left, top, right, bottom);
	}

	public static int getPaddingLeft(android.view.View view) {
		return view.getPaddingLeft();
	}

	public static void setPaddingLeft(android.view.View view, int value) {
		view.setPadding(value, view.getPaddingTop(), view.getPaddingRight(), view.getPaddingBottom());
	}

	public static int getPaddingTop(android.view.View view) {
		return view.getPaddingTop();
	}

	public static void setPaddingTop(android.view.View view, int value) {
		view.setPadding(view.getPaddingLeft(), value, view.getPaddingRight(), view.getPaddingBottom());
	}

	public static int getPaddingRight(android.view.View view) {
		return view.getPaddingRight();
	}

	public static void setPaddingRight(android.view.View view, int value) {
		view.setPadding(view.getPaddingLeft(), view.getPaddingTop(), value, view.getPaddingBottom());
	}

	public static int getPaddingBottom(android.view.View view) {
		return view.getPaddingBottom();
	}

	public static void setPaddingBottom(android.view.View view, int value) {
		view.setPadding(view.getPaddingLeft(), view.getPaddingTop(), view.getPaddingRight(), value);
	}

	public static float getRotate(android.view.View view) {
		return view.getRotation();
	}

	public static void setRotate(android.view.View view, float value) {
		view.setRotation(value);
	}

	public static float getRotateX(android.view.View view) {
		return view.getRotationX();
	}

	public static void setRotateX(android.view.View view, float value) {
		view.setRotationX(value);
	}

	public static float getRotateY(android.view.View view) {
		return view.getRotationY();
	}

	public static void setRotateY(android.view.View view, float value) {
		view.setRotationY(value);
	}

	public static void setPerspective(android.view.View view, float value) {
		view.setCameraDistance(value);
	}

	public static float getScaleX(android.view.View view) {
		return view.getScaleX();
	}

	public static void setScaleX(android.view.View view, float value) {
		view.setScaleX(value);
	}

	public static float getScaleY(android.view.View view) {
		return view.getScaleY();
	}

	public static void setScaleY(android.view.View view, float value) {
		view.setScaleY(value);
	}

	public static float getTranslateX(android.view.View view) {
		return view.getTranslationX();
	}

	public static void setTranslateX(android.view.View view, float value) {
		view.setTranslationX(value);
	}

	public static float getTranslateY(android.view.View view) {
		return view.getTranslationY();
	}

	public static void setTranslateY(android.view.View view, float value) {
		view.setTranslationY(value);
	}

	@TargetApi(21)
	public static float getZIndex(android.view.View view) {
		if (LOLLIPOP) {
			return view.getZ();
		}

		return 0;
	}

	@TargetApi(21)
	public static void setZIndex(android.view.View view, float value) {
		if (LOLLIPOP) {
			view.setZ(value);
		}
	}

	@TargetApi(21)
	public static float getLetterspacing(android.widget.TextView textView) {
		if (LOLLIPOP) {
			return textView.getLetterSpacing();
		}

		return 0;
	}

	@TargetApi(21)
	public static void setLetterspacing(android.widget.TextView textView, float value) {
		if (LOLLIPOP) {
			textView.setLetterSpacing(value);
		}
	}

	public static void setCommonGridLayoutParam(android.view.View view, String type, int value) throws Throwable {
		ViewGroup.LayoutParams params = view.getLayoutParams();
		// Initialize if empty.
		if (params == null) {
			params = new CommonLayoutParams();
		}
		if (params instanceof CommonLayoutParams) {
			switch(type) {
				case "row":
					((CommonLayoutParams)params).row = value;
					break;
				case "rowSpan":
					((CommonLayoutParams)params).rowSpan = value;
					break;
				case "column":
					((CommonLayoutParams)params).column = value;
					break;
				case "columnSpan":
					((CommonLayoutParams)params).columnSpan = value;
					break;
			}
			view.setLayoutParams(params);
		}
		
	}

	@TargetApi(21)
	public static void setOutlineProvider(android.view.View view, int borderTopLeftRadius,
		int borderTopRightRadius,
		int borderBottomRightRadius,
		int borderBottomLeftRadius) {
		if (LOLLIPOP) {
			view.setOutlineProvider(new ViewOutlineProvider() {
				@Override
				public void getOutline(View view, Outline outline) {
					if (borderTopLeftRadius == borderTopRightRadius  && borderTopLeftRadius == borderBottomRightRadius && borderTopLeftRadius == borderBottomLeftRadius) {
						outline.setRoundRect(0,0, view.getWidth(), view.getHeight(), borderTopLeftRadius);
					} else if (TIRAMISU) {
						Path path = new Path();
						float[] radii = {
							borderTopLeftRadius,
							borderTopRightRadius,
							borderBottomRightRadius,
							borderBottomLeftRadius}
						;
						path.addRoundRect(
						0, 0, view.getWidth(), view.getHeight(), radii, Path.Direction.CW);
						outline.setConvexPath(path);
					}
				}
			});
		}
	}

	@TargetApi(21)
	public static void clearOutlineProvider(android.view.View view) {
		view.setOutlineProvider(null);
	}

	public static boolean isTextView(View view) {
		return view instanceof android.widget.TextView;
	}

	public static View getChildAppCompatTextView(ViewGroup view) {
		int numChildren = view.getChildCount();

		for (int i = 0; i < numChildren; i += 1) {
			View childAndroidView = view.getChildAt(i);
			if (childAndroidView instanceof AppCompatTextView) {
				return childAndroidView;
			}
		}
		return null;
	}

	public static void toolbarAccessibilityScreenChanged(androidx.appcompat.widget.Toolbar nativeView) {
		nativeView.setFocusable(false);
		nativeView.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO);

		android.view.View announceView = null;
		int numChildren = nativeView.getChildCount();
		for (int i = 0; i < numChildren; i += 1) {
			View childView = nativeView.getChildAt(i);
			if (childView == null) {
				continue;
			}

			childView.setFocusable(true);
			if (childView instanceof AppCompatTextView) {
				announceView = childView;
				if (PI) {
					announceView.setAccessibilityHeading(true);
				}
			}
		}
		if (announceView == null) {
			announceView = nativeView;
		}

		announceView.setFocusable(true);
		announceView.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_YES);

		announceView.sendAccessibilityEvent(android.view.accessibility.AccessibilityEvent.TYPE_VIEW_FOCUSED);
		announceView.sendAccessibilityEvent(android.view.accessibility.AccessibilityEvent.TYPE_VIEW_ACCESSIBILITY_FOCUSED);
	}
}

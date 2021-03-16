package org.nativescript.widgets;

import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;

public class Utils {
	public static void drawBoxShadow(View view, String value) {
		if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.M) {
			return;
		}
		Log.d("BoxShadowDrawable", "drawBoxShadow");

		Drawable currentBg = view.getBackground();

		if(currentBg != null) {
			Log.d("BoxShadowDrawable", "current BG is: " + currentBg.getClass().getName());
		}

		if(currentBg == null) {
			Log.d("BoxShadowDrawable", "view had no background!");
			currentBg = new ColorDrawable(Color.TRANSPARENT);
		} else if(currentBg instanceof BoxShadowDrawable) {
			currentBg = ((BoxShadowDrawable) view.getBackground()).getWrappedDrawable();
			Log.d("BoxShadowDrawable", "already a BoxShadowDrawable, getting wrapped drawable:" + currentBg.getClass().getName());
		}

		// replace background
		Log.d("BoxShadowDrawable", "replacing background with new BoxShadowDrawable...");
		view.setBackground(new BoxShadowDrawable(currentBg, value));

		Drawable bg = view.getBackground();
		if(bg != null) {
			Log.d("BoxShadowDrawable", "new current bg: " + bg.getClass().getName());
		}

		int count = 0;
		while (view.getParent() != null && view.getParent() instanceof ViewGroup) {
				count++;
				ViewGroup parent = (ViewGroup) view.getParent();
				parent.setClipChildren(false);
				parent.setClipToPadding(false);
				// removing clipping from all breaks the ui
				if (count == 1) {
					break;
				}
			}
	}

//	public static void clearBoxShadow(View view) {
//		if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.M) {
//			return;
//		}
//		Log.d("BoxShadowDrawable", "clearBoxShadow.");
//
//		Drawable bg = view.getBackground();
//		if(bg != null) {
//			Log.d("BoxShadowDrawable", "current bg: " + bg.getClass().getName());
//		}
//		if(bg instanceof BoxShadowDrawable) {
//			Drawable original = ((BoxShadowDrawable) view.getBackground()).getWrappedDrawable();
//			Log.d("BoxShadowDrawable", "BoxShadowDrawable found, resetting to original: " + original.getClass().getName());
//			view.setBackground(null);
////			view.setBackground(original);
//		}
//	}
}

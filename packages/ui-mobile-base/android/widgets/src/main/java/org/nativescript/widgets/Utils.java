package org.nativescript.widgets;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.Context;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.Path;
import android.graphics.Rect;
import android.graphics.Region;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.ParcelFileDescriptor;
import android.util.Base64OutputStream;
import android.util.Log;
import android.util.Pair;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.view.Window;
import android.view.WindowManager;

import androidx.activity.ComponentActivity;
import androidx.activity.SystemBarStyle;
import androidx.annotation.ColorInt;
import androidx.annotation.Nullable;
import androidx.appcompat.content.res.AppCompatResources;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.exifinterface.media.ExifInterface;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.FileDescriptor;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;


public class Utils {

	static final int UPSIDE_DOWN_CAKE = 34;

	public static boolean ignoreEdgeToEdgeOnOlderDevices = false;

	public interface HandleDarkMode {
		boolean onHandle(int bar, Resources resources);
	}

	enum HandleDarkModeBar {
		status(0),
		navigation(1);

		private final int mValue;

		HandleDarkModeBar(int i) {
			this.mValue = i;
		}

		public int getValue() {
			return this.mValue;
		}
	}

	// The light scrim color used in the platform API 29+
// https://cs.android.com/android/platform/superproject/+/master:frameworks/base/core/java/com/android/internal/policy/DecorView.java;drc=6ef0f022c333385dba2c294e35b8de544455bf19;l=142
	static final int DefaultLightScrim = Color.argb(0xe6, 0xFF, 0xFF, 0xFF);

	// The dark scrim color used in the platform.
// https://cs.android.com/android/platform/superproject/+/master:frameworks/base/core/res/res/color/system_bar_background_semi_transparent.xml
// https://cs.android.com/android/platform/superproject/+/master:frameworks/base/core/res/remote_color_resources_res/values/colors.xml;l=67
	static final int DefaultDarkScrim = Color.argb(0x80, 0x1b, 0x1b, 0x1b);

	public static void enableEdgeToEdge(Activity activity, Window window) {
		enableEdgeToEdge(activity, window, null);
	}

	@SuppressWarnings("Deprecated")
	public static void enableEdgeToEdge(Activity activity, Window window, @Nullable HandleDarkMode handleDarkMode) {
		if (activity instanceof ComponentActivity) {
			if (Utils.ignoreEdgeToEdgeOnOlderDevices && Build.VERSION.SDK_INT <= UPSIDE_DOWN_CAKE) {
				return;
			}
			Window activityWindow = activity.getWindow();
			WindowManager.LayoutParams attributes = new WindowManager.LayoutParams();

			if (activityWindow != null) {
				attributes.copyFrom(activityWindow.getAttributes());
				attributes.type = window.getAttributes().type;
				window.setAttributes(attributes);
				WindowCompat.setDecorFitsSystemWindows(window, false);
				window.setStatusBarColor(Color.TRANSPARENT);
				window.setNavigationBarColor(Color.TRANSPARENT);

				Context context = window.getContext();
				if (context != null) {
					Resources resources = context.getResources();
					int uiMode = resources.getConfiguration().uiMode;
					boolean useDarkMode = (uiMode & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;
					WindowInsetsControllerCompat ctrl = WindowCompat.getInsetsController(window, window.getDecorView());
					if (handleDarkMode != null) {
						ctrl.setAppearanceLightStatusBars(
							!handleDarkMode.onHandle(
								HandleDarkModeBar.status.mValue,
								resources
							)
						);

						ctrl.setAppearanceLightNavigationBars(
							!handleDarkMode.onHandle(
								HandleDarkModeBar.navigation.mValue,
								resources
							)
						);
					} else {
						ctrl.setAppearanceLightStatusBars(
							!useDarkMode
						);

						ctrl.setAppearanceLightNavigationBars(
							!useDarkMode
						);

					}


				}
			}

		}
	}

	public static void enableEdgeToEdge(Activity activity) {
		if (activity instanceof ComponentActivity) {
			enableEdgeToEdge((ComponentActivity) activity);
		}
	}

	public static void enableEdgeToEdge(Activity activity, HandleDarkMode handleDarkMode) {
		if (activity instanceof ComponentActivity) {
			ComponentActivity componentActivity = (ComponentActivity) activity;
			enableEdgeToEdge(componentActivity, handleDarkMode);
		}
	}

	public static void enableEdgeToEdge(Activity activity, @ColorInt Integer statusBarLight, @ColorInt Integer statusBarDark, @ColorInt Integer navigationBarLight, @ColorInt Integer navigationBarDark) {
		if (activity instanceof ComponentActivity) {
			ComponentActivity componentActivity = (ComponentActivity) activity;
			enableEdgeToEdge(componentActivity, statusBarLight, statusBarDark, navigationBarLight, navigationBarDark);
		}
	}

	public static void enableEdgeToEdge(Activity activity, @ColorInt Integer statusBarLight, @ColorInt Integer statusBarDark, @ColorInt Integer navigationBarLight, @ColorInt Integer navigationBarDark, HandleDarkMode handleDarkMode) {
		if (activity instanceof ComponentActivity) {
			ComponentActivity componentActivity = (ComponentActivity) activity;
			enableEdgeToEdge(componentActivity, statusBarLight, statusBarDark, navigationBarLight, navigationBarDark, handleDarkMode);
		}
	}

	public static void enableEdgeToEdge(ComponentActivity activity) {
		if (Utils.ignoreEdgeToEdgeOnOlderDevices && Build.VERSION.SDK_INT <= UPSIDE_DOWN_CAKE) {
			return;
		}
		androidx.activity.EdgeToEdge.enable(activity);
	}

	public static void enableEdgeToEdge(ComponentActivity activity, HandleDarkMode handleDarkMode) {
		if (Utils.ignoreEdgeToEdgeOnOlderDevices && Build.VERSION.SDK_INT <= UPSIDE_DOWN_CAKE) {
			return;
		}
		androidx.activity.EdgeToEdge.enable(activity,
			SystemBarStyle.auto(Color.TRANSPARENT, Color.TRANSPARENT, resources -> handleDarkMode.onHandle(HandleDarkModeBar.status.getValue(), resources)),
			SystemBarStyle.auto(DefaultLightScrim, DefaultDarkScrim, resources -> handleDarkMode.onHandle(HandleDarkModeBar.navigation.getValue(), resources))
		);
	}

	public static void enableEdgeToEdge(ComponentActivity activity, @ColorInt Integer statusBarLight, @ColorInt Integer statusBarDark, @ColorInt Integer navigationBarLight, @ColorInt Integer navigationBarDark) {
		if (Utils.ignoreEdgeToEdgeOnOlderDevices && Build.VERSION.SDK_INT <= UPSIDE_DOWN_CAKE) {
			return;
		}
		androidx.activity.EdgeToEdge.enable(activity,
			SystemBarStyle.auto(statusBarLight, statusBarDark),
			SystemBarStyle.auto(navigationBarLight, navigationBarDark)
		);
	}

	public static void enableEdgeToEdge(ComponentActivity activity, @ColorInt Integer statusBarLight, @ColorInt Integer statusBarDark, @ColorInt Integer navigationBarLight, @ColorInt Integer navigationBarDark, HandleDarkMode handleDarkMode) {
		if (Utils.ignoreEdgeToEdgeOnOlderDevices && Build.VERSION.SDK_INT <= UPSIDE_DOWN_CAKE) {
			return;
		}
		androidx.activity.EdgeToEdge.enable(activity,
			SystemBarStyle.auto(statusBarLight, statusBarDark, resources -> handleDarkMode.onHandle(HandleDarkModeBar.status.getValue(), resources)),
			SystemBarStyle.auto(navigationBarLight, navigationBarDark, resources -> handleDarkMode.onHandle(HandleDarkModeBar.navigation.getValue(), resources))
		);
	}


	public static Drawable getDrawable(String uri, Context context) {
		int resId = 0;
		int resPrefixLength = "res://".length();

		if (uri.length() > resPrefixLength) {
			String resPath = uri.substring(resPrefixLength);
			resId = context.getResources().getIdentifier(resPath, "drawable", context.getPackageName());
		}

		if (resId > 0) {
			return AppCompatResources.getDrawable(context, resId);
		} else {
			Log.v("JS", "Missing Image with resourceID: " + uri);
			return null;
		}
	}

	private static Bitmap drawBitmap(View view) {
		int width = view.getWidth();
		int height = view.getHeight();
		Bitmap bitmap;
		if (view.getAlpha() < 1F) {
			bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
		} else {
			bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565);
		}
		Canvas canvas = new Canvas(bitmap);
		// ViewCompat.isLaidOut is deprecated; View#isLaidOut is available since API 19
		if (!view.isLaidOut()) {
			view.layout(0, 0, width, height);
		}
		view.draw(canvas);
		return bitmap;
	}

	@SuppressWarnings("deprecation")
	public static Bitmap getBitmapFromView(View view) {
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
			return drawBitmap(view);
		} else {

			view.setDrawingCacheEnabled(true);
			Bitmap drawCache = view.getDrawingCache();
			Bitmap bitmap = Bitmap.createBitmap(drawCache);
			view.setDrawingCacheEnabled(false);

			if (bitmap == null) {
				bitmap = drawBitmap(view);
			}

			return bitmap;
		}
	}

	public static Bitmap getBitmapFromDrawable(Drawable drawable) {
		if (drawable instanceof BitmapDrawable) {
			return ((BitmapDrawable) drawable).getBitmap();
		} else {
			Bitmap bitmap = Bitmap.createBitmap(drawable.getIntrinsicWidth(), drawable.getIntrinsicHeight(), Bitmap.Config.ARGB_8888);
			Canvas canvas = new Canvas(bitmap);
			Rect previousBounds = null;

			if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
				previousBounds = drawable.getBounds();
				drawable.setBounds(0, 0, drawable.getIntrinsicWidth(), drawable.getIntrinsicHeight());
			}

			drawable.draw(canvas);

			if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
				drawable.setBounds(previousBounds);
			}
			return bitmap;
		}
	}

	@SuppressWarnings("deprecation")
	private static void clipCanvasOutPathLegacy(Canvas canvas, Path clipPath) {
		canvas.clipPath(clipPath, Region.Op.DIFFERENCE);
	}

	public static void clipCanvasOutPath(Canvas canvas, Path clipPath) {
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
			canvas.clipOutPath(clipPath);
		} else {
			clipCanvasOutPathLegacy(canvas, clipPath);
		}
	}

	public static void drawBoxShadow(View view, int[] values) {
		if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.M) {
			return;
		}
		Log.d("BoxShadowDrawable", "drawBoxShadow");

		Drawable background = view.getBackground();
		Drawable wrappedBg;

		if (background != null) {
			Log.d("BoxShadowDrawable", "current background is: " + background.getClass().getName());

			if (background instanceof BoxShadowDrawable) {
				wrappedBg = ((BoxShadowDrawable) background).getWrappedDrawable();

				if (wrappedBg != null) {
					Log.d("BoxShadowDrawable", "already a BoxShadowDrawable, getting wrapped drawable:" + wrappedBg.getClass().getName());
				}
			} else {
				wrappedBg = background;
			}
		} else {
			wrappedBg = null;
		}

		// replace background
		Log.d("BoxShadowDrawable", "replacing background with new BoxShadowDrawable...");
		view.setBackground(new BoxShadowDrawable(wrappedBg, values));

		background = view.getBackground();
		if (background != null) {
			Log.d("BoxShadowDrawable", "new background is: " + background.getClass().getName());
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

	public interface AsyncImageCallback {
		void onSuccess(Object bitmap);

		void onError(Exception exception);
	}

	static class ImageAssetOptions {
		int width;
		int height;
		boolean keepAspectRatio;
		boolean autoScaleFactor;
	}

	private static int parsePositiveInt(JSONObject object, String key) {
		if (object == null || key == null) {
			return 0;
		}
		try {
			if (!object.has(key) || object.isNull(key)) {
				return 0;
			}
			Object value = object.get(key);
			if (value instanceof Number) {
				int parsed = (int) Math.floor(((Number) value).doubleValue());
				return parsed > 0 ? parsed : 0;
			}
			if (value instanceof String) {
				String s = ((String) value).trim();
				if (s.length() == 0) {
					return 0;
				}
				try {
					int parsed = Integer.parseInt(s);
					return parsed > 0 ? parsed : 0;
				} catch (NumberFormatException ignored) {
					return 0;
				}
			}
		} catch (JSONException ignored) {
		}
		return 0;
	}

	private static final Executor executors = Executors.newCachedThreadPool();


	private static Pair<Integer, Integer> getAspectSafeDimensions(float sourceWidth, float sourceHeight, float reqWidth, float reqHeight) {
		float widthCoef = sourceWidth / reqWidth;
		float heightCoef = sourceHeight / reqHeight;
		float aspectCoef = Math.min(widthCoef, heightCoef);

		return new Pair<>((int) Math.floor(sourceWidth / aspectCoef), (int) Math.floor(sourceHeight / aspectCoef));
	}


	private static Pair<Integer, Integer> getRequestedImageSize(Pair<Integer, Integer> src, Pair<Integer, Integer> maxSize, ImageAssetOptions options) {
		int reqWidth = options.width;
		if (reqWidth <= 0) {
			reqWidth = Math.min(src.first, maxSize.first);
		}
		int reqHeight = options.height;
		if (reqHeight <= 0) {
			reqHeight = Math.min(src.second, maxSize.second);
		}

		if (options.keepAspectRatio) {
			Pair<Integer, Integer> safeAspectSize = getAspectSafeDimensions(src.first, src.second, reqWidth, reqHeight);
			reqWidth = safeAspectSize.first;
			reqHeight = safeAspectSize.second;
		}

		return new Pair<>(reqWidth, reqHeight);
	}


	private static void closePfd(ParcelFileDescriptor pfd) {
		if (pfd != null) {
			try {
				pfd.close();
			} catch (IOException ignored) {
			}
		}
	}

	private static int calculateAngleFromFile(String filename) {
		int rotationAngle = 0;
		ExifInterface ei;
		try {
			ei = new ExifInterface(filename);
			int orientation = ei.getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL);

			switch (orientation) {
				case ExifInterface.ORIENTATION_ROTATE_90:
					rotationAngle = 90;
					break;
				case ExifInterface.ORIENTATION_ROTATE_180:
					rotationAngle = 180;
					break;
				case ExifInterface.ORIENTATION_ROTATE_270:
					rotationAngle = 270;
					break;
			}
		} catch (IOException ignored) {
		}

		return rotationAngle;
	}


	private static int calculateAngleFromFileDescriptor(FileDescriptor fd) {
		int rotationAngle = 0;
		ExifInterface ei;
		try {
			ei = new ExifInterface(fd);
			int orientation = ei.getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL);

			switch (orientation) {
				case ExifInterface.ORIENTATION_ROTATE_90:
					rotationAngle = 90;
					break;
				case ExifInterface.ORIENTATION_ROTATE_180:
					rotationAngle = 180;
					break;
				case ExifInterface.ORIENTATION_ROTATE_270:
					rotationAngle = 270;
					break;
			}
		} catch (IOException ignored) {
		}

		return rotationAngle;
	}

	public static void loadImageAsync(final Context context, final String src, final String options, final int maxWidth, final int maxHeight, final AsyncImageCallback callback) {
		final Handler mHandler = new Handler(Looper.myLooper());
		executors.execute(new Runnable() {
			@Override
			public void run() {
				BitmapFactory.Options bitmapOptions = new BitmapFactory.Options();
				bitmapOptions.inJustDecodeBounds = true;

				try {
					Bitmap bitmap;
					ParcelFileDescriptor pfd = null;
					if (src.startsWith("content://")) {
						Uri uri = android.net.Uri.parse(src);
						ContentResolver resolver = context.getContentResolver();
						try {
							pfd = resolver.openFileDescriptor(uri, "r");
						} catch (final FileNotFoundException e) {
							mHandler.post(new Runnable() {
								@Override
								public void run() {
									callback.onError(e);
								}
							});
							closePfd(pfd);
							return;
						}
						android.graphics.BitmapFactory.decodeFileDescriptor(pfd.getFileDescriptor(), null, bitmapOptions);
					} else {
						android.graphics.BitmapFactory.decodeFile(src, bitmapOptions);
					}

					ImageAssetOptions opts = new ImageAssetOptions();
					opts.keepAspectRatio = true;
					opts.autoScaleFactor = true;

					try {
						JSONObject object = new JSONObject(options);
						// Coerce numeric strings or numbers; fallback to 0 for invalid values
						opts.width = parsePositiveInt(object, "width");
						opts.height = parsePositiveInt(object, "height");
						opts.keepAspectRatio = object.optBoolean("keepAspectRatio", true);
						opts.autoScaleFactor = object.optBoolean("autoScaleFactor", true);
					} catch (JSONException ignored) {
					}


					Pair<Integer, Integer> sourceSize = new Pair<>(bitmapOptions.outWidth, bitmapOptions.outHeight);
					Pair<Integer, Integer> maxSize = new Pair<>(maxWidth, maxHeight);
					Pair<Integer, Integer> requestedSize = getRequestedImageSize(sourceSize, maxSize, opts);
					int sampleSize = org.nativescript.widgets.image.Fetcher.calculateInSampleSize(bitmapOptions.outWidth, bitmapOptions.outHeight, requestedSize.first, requestedSize.second);
					BitmapFactory.Options finalBitmapOptions = new BitmapFactory.Options();
					finalBitmapOptions.inSampleSize = sampleSize;


					String error = null;
					// read as minimum bitmap as possible (slightly bigger than the requested size)


					if (pfd != null) {
						bitmap = BitmapFactory.decodeFileDescriptor(pfd.getFileDescriptor(), null, finalBitmapOptions);
					} else {
						bitmap = android.graphics.BitmapFactory.decodeFile(src, finalBitmapOptions);
					}


					if (bitmap != null) {
						if (requestedSize.first != bitmap.getWidth() || requestedSize.second != bitmap.getHeight()) {
							// scale to exact size
							bitmap = android.graphics.Bitmap.createScaledBitmap(bitmap, requestedSize.first, requestedSize.second, true);
						}
						int rotationAngle;

						if (pfd != null) {
							rotationAngle = calculateAngleFromFileDescriptor(pfd.getFileDescriptor());
							closePfd(pfd);
						} else {
							rotationAngle = calculateAngleFromFile(src);
						}

						if (rotationAngle != 0) {
							Matrix matrix = new android.graphics.Matrix();
							matrix.postRotate(rotationAngle);
							bitmap = android.graphics.Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
						}
					}
					if (bitmap == null) {
						error = "Asset '" + src + "' cannot be found.";
					}

					final String finalError = error;
					final Bitmap finalBitmap = bitmap;
					mHandler.post(new Runnable() {
						@Override
						public void run() {
							if (finalError != null) {
								callback.onError(new Exception(finalError));
							} else {
								callback.onSuccess(finalBitmap);
							}
						}
					});
				} catch (final Exception ex) {
					mHandler.post(new Runnable() {
						@Override
						public void run() {
							callback.onError(ex);
						}
					});
				}
			}
		});
	}

	static Bitmap.CompressFormat getTargetFormat(String format) {
		switch (format) {
			case "jpeg":
			case "jpg":
				return Bitmap.CompressFormat.JPEG;
			default:
				return Bitmap.CompressFormat.PNG;
		}
	}


	public static void saveToFileAsync(final Bitmap bitmap, final String path, final String format, final int quality, final AsyncImageCallback callback) {
		final Handler mHandler = new Handler(Looper.myLooper());
		executors.execute(new Runnable() {
			@Override
			public void run() {
				boolean isSuccess = false;
				Exception exception = null;
				if (bitmap != null) {
					Bitmap.CompressFormat targetFormat = getTargetFormat(format);
					try (BufferedOutputStream outputStream = new BufferedOutputStream(new java.io.FileOutputStream(path))) {
						isSuccess = bitmap.compress(targetFormat, quality, outputStream);
					} catch (Exception e) {
						exception = e;
					}
				}

				final Exception finalException = exception;
				final boolean finalIsSuccess = isSuccess;
				mHandler.post(new Runnable() {
					@Override
					public void run() {
						if (finalException != null) {
							callback.onError(finalException);
						} else {
							callback.onSuccess(finalIsSuccess);
						}
					}
				});
			}
		});
	}

	public static void toBase64StringAsync(final Bitmap bitmap, final String format, final int quality, final AsyncImageCallback callback) {
		final Handler mHandler = new Handler(Looper.myLooper());
		executors.execute(new Runnable() {
			@Override
			public void run() {
				String result = null;
				Exception exception = null;
				if (bitmap != null) {

					Bitmap.CompressFormat targetFormat = getTargetFormat(format);

					try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream(); Base64OutputStream base64Stream = new Base64OutputStream(outputStream, android.util.Base64.NO_WRAP)) {
						bitmap.compress(targetFormat, quality, base64Stream);
						result = outputStream.toString();
					} catch (Exception e) {
						exception = e;
					}
				}

				final Exception finalException = exception;
				final String finalResult = result;
				mHandler.post(new Runnable() {
					@Override
					public void run() {
						if (finalException != null) {
							callback.onError(finalException);
						} else {
							callback.onSuccess(finalResult);
						}
					}
				});
			}
		});
	}

	static Pair<Integer, Integer> getScaledDimensions(float width, float height, float maxSize) {
		if (height >= width) {
			if (height <= maxSize) {
				// if image already smaller than the required height
				return new Pair<>((int) width, (int) height);
			}

			return new Pair<>(Math.round((maxSize * width) / height), (int) maxSize);
		}

		if (width <= maxSize) {
			// if image already smaller than the required width
			return new Pair<>((int) width, (int) height);
		}

		return new Pair<>((int) maxSize, Math.round((maxSize * height) / width));

	}

	public static void resizeAsync(final Bitmap bitmap, final float maxSize, final String options, final AsyncImageCallback callback) {
		final Handler mHandler = new Handler(Looper.myLooper());
		executors.execute(new Runnable() {
			@Override
			public void run() {
				Bitmap result = null;
				Exception exception = null;
				if (bitmap != null) {
					Pair<Integer, Integer> dim = getScaledDimensions(bitmap.getWidth(), bitmap.getHeight(), maxSize);
					boolean filter = false;
					if (options != null) {
						try {
							JSONObject json = new JSONObject(options);
							filter = json.optBoolean("filter", false);
						} catch (JSONException ignored) {
						}
					}
					try {
						result = android.graphics.Bitmap.createScaledBitmap(bitmap, dim.first, dim.second, filter);
					} catch (Exception e) {
						exception = e;
					}
				}

				final Exception finalException = exception;
				final Bitmap finalResult = result;
				mHandler.post(new Runnable() {
					@Override
					public void run() {
						if (finalException != null) {
							callback.onError(finalException);
						} else {
							callback.onSuccess(finalResult);
						}
					}
				});
			}
		});
	}

	/**
	 * Return true if child is a descendant of parent, (or equal to the parent).
	 */
	static boolean isViewDescendantOf(View child, View parent) {
		if (child == parent) {
			return true;
		}

		final ViewParent childParent = child.getParent();
		return (childParent instanceof ViewGroup) && isViewDescendantOf((View) childParent, parent);
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

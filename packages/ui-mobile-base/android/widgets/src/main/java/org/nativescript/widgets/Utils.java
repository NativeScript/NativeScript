package org.nativescript.widgets;

import android.content.ContentResolver;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.os.ParcelFileDescriptor;
import android.util.Log;
import android.util.Pair;
import android.view.View;
import android.view.ViewGroup;

import androidx.exifinterface.media.ExifInterface;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.FileDescriptor;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

public class Utils {
	public static void drawBoxShadow(View view, String value) {
		if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.M) {
			return;
		}
		Log.d("BoxShadowDrawable", "drawBoxShadow");

		Drawable currentBg = view.getBackground();

		if (currentBg != null) {
			Log.d("BoxShadowDrawable", "current BG is: " + currentBg.getClass().getName());
		}

		if (currentBg == null) {
			Log.d("BoxShadowDrawable", "view had no background!");
			currentBg = new ColorDrawable(Color.TRANSPARENT);
		} else if (currentBg instanceof BoxShadowDrawable) {
			currentBg = ((BoxShadowDrawable) view.getBackground()).getWrappedDrawable();
			Log.d("BoxShadowDrawable", "already a BoxShadowDrawable, getting wrapped drawable:" + currentBg.getClass().getName());
		}

		// replace background
		Log.d("BoxShadowDrawable", "replacing background with new BoxShadowDrawable...");
		view.setBackground(new BoxShadowDrawable(currentBg, value));

		Drawable bg = view.getBackground();
		if (bg != null) {
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

	public interface AsyncImageCallback {
		void onSuccess(Bitmap bitmap);

		void onError(Exception exception);
	}

	static class ImageAssetOptions {
		int width;
		int height;
		boolean keepAspectRatio;
		boolean autoScaleFactor;
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

	private static final Handler mainHandler = new Handler(Looper.getMainLooper());

	public static void loadImageAsync(final Context context, final String src, final String options, final int maxWidth, final int maxHeight, final AsyncImageCallback callback) {
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
							mainHandler.post(new Runnable() {
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
						opts.width = object.optInt("width", 0);
						opts.height = object.optInt("height", 0);
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
					mainHandler.post(new Runnable() {
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
					mainHandler.post(new Runnable() {
						@Override
						public void run() {
							callback.onError(ex);
						}
					});
				}
			}
		});
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

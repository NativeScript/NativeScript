package org.nativescript.widgets;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.BitmapShader;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.ColorMatrix;
import android.graphics.ColorMatrixColorFilter;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffColorFilter;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.Shader;
import android.graphics.Typeface;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.view.View;

import androidx.exifinterface.media.ExifInterface;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedOutputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;
import java.util.concurrent.Callable;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

/**
 * Pixel-level image helpers backing {@code ImageSource} in @nativescript/core.
 * <p>
 * Every operation returns a NEW bitmap and never mutates its input. All sizes
 * are in pixels. Orientation is always baked into pixels before geometry work,
 * so callers never need to reason about EXIF flags after loading.
 * <p>
 * The {@code *Async} variants run the same code on a small worker pool and hand
 * the result back on the calling thread's looper via {@link Utils.AsyncImageCallback}.
 */
public class ImageUtils {

	private static final Executor executor = Executors.newFixedThreadPool(2);

	/** Result of {@link #compressToFit}: encoded bytes plus the quality that satisfied the budget. */
	public static class CompressResult {
		public final ByteBuffer data;
		public final int quality;

		CompressResult(ByteBuffer data, int quality) {
			this.data = data;
			this.quality = quality;
		}
	}

	/**
	 * Hardware bitmaps (Config.HARDWARE, API 26+) cannot be drawn into a software
	 * Canvas, read with getPixels, or used as a BitmapShader source. Every operation
	 * starts from a software copy when needed.
	 */
	static Bitmap software(Bitmap bitmap) {
		if (bitmap == null) {
			return null;
		}

		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && bitmap.getConfig() == Bitmap.Config.HARDWARE) {
			return bitmap.copy(Bitmap.Config.ARGB_8888, false);
		}

		return bitmap;
	}

	// ---------------------------------------------------------------------
	// Async plumbing
	// ---------------------------------------------------------------------

	private static void runAsync(final Callable<Object> work, final Utils.AsyncImageCallback callback) {
		final Handler handler = new Handler(Looper.myLooper() != null ? Looper.myLooper() : Looper.getMainLooper());
		executor.execute(new Runnable() {
			@Override
			public void run() {
				Object result = null;
				Exception error = null;
				try {
					result = work.call();
				} catch (Exception e) {
					error = e;
				} catch (OutOfMemoryError e) {
					error = new Exception("Out of memory while processing image", e);
				}

				final Object finalResult = result;
				final Exception finalError = error;
				handler.post(new Runnable() {
					@Override
					public void run() {
						if (finalError != null) {
							callback.onError(finalError);
						} else {
							callback.onSuccess(finalResult);
						}
					}
				});
			}
		});
	}

	// ---------------------------------------------------------------------
	// Decoding
	// ---------------------------------------------------------------------

	/**
	 * Decodes a file, sub-sampling during decode so the long edge is at most
	 * {@code maxSize} pixels (0 = full size), then bakes EXIF orientation in.
	 */
	public static Bitmap decodeFile(String path, int maxSize) throws IOException {
		BitmapFactory.Options bounds = new BitmapFactory.Options();
		bounds.inJustDecodeBounds = true;
		BitmapFactory.decodeFile(path, bounds);
		if (bounds.outWidth <= 0 || bounds.outHeight <= 0) {
			return null;
		}

		BitmapFactory.Options options = new BitmapFactory.Options();
		options.inSampleSize = calculateInSampleSize(bounds.outWidth, bounds.outHeight, maxSize);
		options.inPreferredConfig = Bitmap.Config.ARGB_8888;
		Bitmap bitmap = BitmapFactory.decodeFile(path, options);
		if (bitmap == null) {
			return null;
		}

		int orientation = readExifOrientation(path);
		bitmap = applyExifOrientation(bitmap, orientation);

		if (maxSize > 0 && Math.max(bitmap.getWidth(), bitmap.getHeight()) > maxSize) {
			bitmap = resize(bitmap, maxSize, true);
		}

		return bitmap;
	}

	public static void decodeFileAsync(final String path, final int maxSize, final Utils.AsyncImageCallback callback) {
		runAsync(new Callable<Object>() {
			@Override
			public Object call() throws Exception {
				Bitmap bitmap = decodeFile(path, maxSize);
				if (bitmap == null) {
					throw new IOException("Unable to decode image at '" + path + "'");
				}

				return bitmap;
			}
		}, callback);
	}

	/** Decodes encoded image bytes (JPEG/PNG/WebP/HEIF) with optional sub-sampling. */
	public static Bitmap decodeBytes(byte[] bytes, int maxSize) {
		if (bytes == null || bytes.length == 0) {
			return null;
		}

		BitmapFactory.Options bounds = new BitmapFactory.Options();
		bounds.inJustDecodeBounds = true;
		BitmapFactory.decodeByteArray(bytes, 0, bytes.length, bounds);
		if (bounds.outWidth <= 0 || bounds.outHeight <= 0) {
			return null;
		}

		BitmapFactory.Options options = new BitmapFactory.Options();
		options.inSampleSize = calculateInSampleSize(bounds.outWidth, bounds.outHeight, maxSize);
		options.inPreferredConfig = Bitmap.Config.ARGB_8888;
		Bitmap bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.length, options);
		if (bitmap == null) {
			return null;
		}

		bitmap = applyExifOrientation(bitmap, readExifOrientation(bytes));
		if (maxSize > 0 && Math.max(bitmap.getWidth(), bitmap.getHeight()) > maxSize) {
			bitmap = resize(bitmap, maxSize, true);
		}

		return bitmap;
	}

	public static Bitmap decodeBuffer(ByteBuffer buffer, int maxSize) {
		return decodeBytes(toByteArray(buffer), maxSize);
	}

	public static void decodeBufferAsync(final ByteBuffer buffer, final int maxSize, final Utils.AsyncImageCallback callback) {
		final byte[] bytes = toByteArray(buffer);
		runAsync(new Callable<Object>() {
			@Override
			public Object call() throws Exception {
				Bitmap bitmap = decodeBytes(bytes, maxSize);
				if (bitmap == null) {
					throw new IOException("Unable to decode image from data");
				}

				return bitmap;
			}
		}, callback);
	}

	public static Bitmap decodeBase64(String source, int maxSize) {
		byte[] bytes = android.util.Base64.decode(source, android.util.Base64.DEFAULT);
		return decodeBytes(bytes, maxSize);
	}

	public static void decodeBase64Async(final String source, final int maxSize, final Utils.AsyncImageCallback callback) {
		runAsync(new Callable<Object>() {
			@Override
			public Object call() throws Exception {
				Bitmap bitmap = decodeBase64(source, maxSize);
				if (bitmap == null) {
					throw new IOException("Unable to decode base64 image");
				}

				return bitmap;
			}
		}, callback);
	}

	static int calculateInSampleSize(int width, int height, int maxSize) {
		int sample = 1;
		if (maxSize > 0) {
			while ((Math.max(width, height) / (sample * 2)) >= maxSize) {
				sample *= 2;
			}
		}

		return sample;
	}

	private static byte[] toByteArray(ByteBuffer buffer) {
		if (buffer == null) {
			return new byte[0];
		}

		ByteBuffer dup = buffer.duplicate();
		dup.rewind();
		byte[] bytes = new byte[dup.remaining()];
		dup.get(bytes);
		return bytes;
	}

	// ---------------------------------------------------------------------
	// Metadata / orientation
	// ---------------------------------------------------------------------

	public static int readExifOrientation(byte[] bytes) {
		try {
			ExifInterface exif = new ExifInterface(new ByteArrayInputStream(bytes));
			return exif.getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL);
		} catch (IOException e) {
			return ExifInterface.ORIENTATION_NORMAL;
		}
	}

	public static int readExifOrientation(String path) {
		try {
			ExifInterface exif = new ExifInterface(path);
			return exif.getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL);
		} catch (IOException e) {
			return ExifInterface.ORIENTATION_NORMAL;
		}
	}

	/** Rotation in degrees (0/90/180/270) implied by an EXIF orientation value. */
	public static int rotationForExifOrientation(int orientation) {
		switch (orientation) {
			case ExifInterface.ORIENTATION_ROTATE_90:
			case ExifInterface.ORIENTATION_TRANSPOSE:
				return 90;
			case ExifInterface.ORIENTATION_ROTATE_180:
			case ExifInterface.ORIENTATION_FLIP_VERTICAL:
				return 180;
			case ExifInterface.ORIENTATION_ROTATE_270:
			case ExifInterface.ORIENTATION_TRANSVERSE:
				return 270;
			default:
				return 0;
		}
	}

	/** Bakes a full EXIF orientation (including mirrored variants) into pixels. */
	public static Bitmap applyExifOrientation(Bitmap bitmap, int orientation) {
		if (bitmap == null || orientation == ExifInterface.ORIENTATION_NORMAL || orientation == ExifInterface.ORIENTATION_UNDEFINED) {
			return bitmap;
		}

		Matrix matrix = new Matrix();
		switch (orientation) {
			case ExifInterface.ORIENTATION_FLIP_HORIZONTAL:
				matrix.setScale(-1, 1);
				break;
			case ExifInterface.ORIENTATION_ROTATE_180:
				matrix.setRotate(180);
				break;
			case ExifInterface.ORIENTATION_FLIP_VERTICAL:
				matrix.setScale(1, -1);
				break;
			case ExifInterface.ORIENTATION_TRANSPOSE:
				matrix.setRotate(90);
				matrix.postScale(-1, 1);
				break;
			case ExifInterface.ORIENTATION_ROTATE_90:
				matrix.setRotate(90);
				break;
			case ExifInterface.ORIENTATION_TRANSVERSE:
				matrix.setRotate(270);
				matrix.postScale(-1, 1);
				break;
			case ExifInterface.ORIENTATION_ROTATE_270:
				matrix.setRotate(270);
				break;
			default:
				return bitmap;
		}

		return Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
	}

	/** Rotates pixels by a plain rotation angle (what {@code ImageSource.rotationAngle} stores). */
	public static Bitmap applyRotation(Bitmap bitmap, int rotationAngle) {
		if (bitmap == null || rotationAngle % 360 == 0) {
			return bitmap;
		}

		return rotate(bitmap, rotationAngle);
	}

	/**
	 * Reads size and EXIF information without decoding pixels. Returned as a JSON
	 * string so the JS side can parse it in one call.
	 */
	public static String getMetadata(String path) {
		JSONObject json = new JSONObject();
		try {
			BitmapFactory.Options bounds = new BitmapFactory.Options();
			bounds.inJustDecodeBounds = true;
			BitmapFactory.decodeFile(path, bounds);
			if (bounds.outWidth <= 0 || bounds.outHeight <= 0) {
				return null;
			}

			int orientation = ExifInterface.ORIENTATION_NORMAL;
			ExifInterface exif = null;
			try {
				exif = new ExifInterface(path);
				orientation = exif.getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL);
			} catch (IOException ignored) {
			}

			int width = bounds.outWidth;
			int height = bounds.outHeight;
			int rotation = rotationForExifOrientation(orientation);
			if (rotation == 90 || rotation == 270) {
				int tmp = width;
				width = height;
				height = tmp;
			}

			json.put("width", width);
			json.put("height", height);
			json.put("orientation", orientation);
			String mime = bounds.outMimeType != null ? bounds.outMimeType : "";
			json.put("mimeType", mime);
			json.put("hasAlpha", mime.contains("png") || mime.contains("webp") || mime.contains("gif"));
			if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && bounds.outColorSpace != null) {
				json.put("colorSpace", bounds.outColorSpace.getName());
			}

			if (exif != null) {
				String xRes = exif.getAttribute(ExifInterface.TAG_X_RESOLUTION);
				if (xRes != null) {
					try {
						String[] parts = xRes.split("/");
						double dpi = parts.length == 2 ? Double.parseDouble(parts[0]) / Double.parseDouble(parts[1]) : Double.parseDouble(xRes);
						json.put("dpi", dpi);
					} catch (NumberFormatException ignored) {
					}
				}

				String date = exif.getAttribute(ExifInterface.TAG_DATETIME_ORIGINAL);
				if (date == null) {
					date = exif.getAttribute(ExifInterface.TAG_DATETIME);
				}

				if (date != null) {
					try {
						SimpleDateFormat fmt = new SimpleDateFormat("yyyy:MM:dd HH:mm:ss", Locale.US);
						fmt.setTimeZone(TimeZone.getDefault());
						json.put("dateTaken", fmt.parse(date).getTime());
					} catch (ParseException ignored) {
					}
				}

				double[] latLong = exif.getLatLong();
				if (latLong != null) {
					JSONObject gps = new JSONObject();
					gps.put("latitude", latLong[0]);
					gps.put("longitude", latLong[1]);
					json.put("gps", gps);
				}
			}
		} catch (JSONException e) {
			return null;
		}

		return json.toString();
	}

	// ---------------------------------------------------------------------
	// Encoding / saving
	// ---------------------------------------------------------------------

	static Bitmap.CompressFormat compressFormat(String format) {
		if (format == null) {
			return Bitmap.CompressFormat.PNG;
		}

		switch (format.toLowerCase(Locale.US)) {
			case "jpeg":
			case "jpg":
				return Bitmap.CompressFormat.JPEG;
			default:
				return Bitmap.CompressFormat.PNG;
		}
	}

	public static byte[] encodeToBytes(Bitmap bitmap, String format, int quality) throws IOException {
		if (bitmap == null) {
			return null;
		}

		bitmap = software(bitmap);

		bitmap = software(bitmap);

		try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			if (!bitmap.compress(compressFormat(format), clampQuality(quality), out)) {
				return null;
			}

			return out.toByteArray();
		}
	}

	/** Encodes to a direct ByteBuffer, which the JS runtime exposes as an ArrayBuffer without copying. */
	public static ByteBuffer encode(Bitmap bitmap, String format, int quality) throws IOException {
		byte[] bytes = encodeToBytes(bitmap, format, quality);
		return bytes == null ? null : toDirectBuffer(bytes);
	}

	public static void encodeAsync(final Bitmap bitmap, final String format, final int quality, final Utils.AsyncImageCallback callback) {
		runAsync(new Callable<Object>() {
			@Override
			public Object call() throws Exception {
				ByteBuffer data = encode(bitmap, format, quality);
				if (data == null) {
					throw new IOException("Unable to encode image as " + format);
				}

				return data;
			}
		}, callback);
	}

	/**
	 * Binary-searches JPEG quality so the encoded size is at or under {@code maxBytes}.
	 * Returns null when even the lowest quality (or the single PNG encode) exceeds the
	 * budget, so callers never receive bytes over the limit they asked for.
	 */
	public static CompressResult compressToFit(Bitmap bitmap, long maxBytes, String format) throws IOException {
		if (bitmap == null) {
			return null;
		}

		if (compressFormat(format) == Bitmap.CompressFormat.PNG) {
			byte[] png = encodeToBytes(bitmap, format, 100);
			return png == null || png.length > maxBytes ? null : new CompressResult(toDirectBuffer(png), 100);
		}

		int lo = 1;
		int hi = 100;
		byte[] best = null;
		int bestQuality = -1;
		while (lo <= hi) {
			int mid = (lo + hi) / 2;
			byte[] candidate = encodeToBytes(bitmap, format, mid);
			if (candidate == null) {
				return null;
			}

			if (candidate.length <= maxBytes) {
				best = candidate;
				bestQuality = mid;
				lo = mid + 1;
			} else {
				hi = mid - 1;
			}
		}

		// Even quality 1 is over budget: the caller has to shrink the image first.
		return best == null ? null : new CompressResult(toDirectBuffer(best), bestQuality);
	}

	public static void compressToFitAsync(final Bitmap bitmap, final long maxBytes, final String format, final Utils.AsyncImageCallback callback) {
		runAsync(new Callable<Object>() {
			@Override
			public Object call() throws Exception {
				CompressResult result = compressToFit(bitmap, maxBytes, format);
				if (result == null) {
					throw new IOException("Unable to fit image under " + maxBytes + " bytes; resize it first");
				}

				return result;
			}
		}, callback);
	}

	/**
	 * Writes atomically: encodes into a sibling temp file, then renames over the
	 * destination so a reader never sees a half-written image.
	 */
	public static boolean saveToFile(Bitmap bitmap, String path, String format, int quality) throws IOException {
		if (bitmap == null) {
			return false;
		}

		bitmap = software(bitmap);
		File target = new File(path);
		File parent = target.getParentFile();
		if (parent != null && !parent.exists() && !parent.mkdirs()) {
			throw new IOException("Unable to create directory '" + parent.getAbsolutePath() + "'");
		}

		File temp = new File(parent, "." + target.getName() + "." + System.nanoTime() + ".tmp");
		boolean ok;
		try (BufferedOutputStream out = new BufferedOutputStream(new FileOutputStream(temp))) {
			ok = bitmap.compress(compressFormat(format), clampQuality(quality), out);
			out.flush();
		}

		if (!ok) {
			//noinspection ResultOfMethodCallIgnored
			temp.delete();
			return false;
		}

		// rename(2) replaces an existing destination atomically on the same filesystem,
		// so a reader sees either the old complete file or the new complete file.
		if (!temp.renameTo(target)) {
			//noinspection ResultOfMethodCallIgnored
			temp.delete();
			throw new IOException("Unable to move temp file into '" + path + "'");
		}

		return true;
	}

	public static void saveToFileAsync(final Bitmap bitmap, final String path, final String format, final int quality, final Utils.AsyncImageCallback callback) {
		runAsync(new Callable<Object>() {
			@Override
			public Object call() throws Exception {
				return saveToFile(bitmap, path, format, quality);
			}
		}, callback);
	}

	private static int clampQuality(int quality) {
		return Math.max(0, Math.min(100, quality));
	}

	private static ByteBuffer toDirectBuffer(byte[] bytes) {
		ByteBuffer buffer = ByteBuffer.allocateDirect(bytes.length);
		buffer.put(bytes);
		buffer.rewind();
		return buffer;
	}

	// ---------------------------------------------------------------------
	// Geometry
	// ---------------------------------------------------------------------

	public static Bitmap crop(Bitmap bitmap, int x, int y, int width, int height) {
		if (bitmap == null) {
			return null;
		}

		bitmap = software(bitmap);

		if (width <= 0 || height <= 0 || x < 0 || y < 0 || x + width > bitmap.getWidth() || y + height > bitmap.getHeight()) {
			throw new IllegalArgumentException("Crop rect " + x + "," + y + " " + width + "x" + height + " is outside the " + bitmap.getWidth() + "x" + bitmap.getHeight() + " image");
		}

		return Bitmap.createBitmap(bitmap, x, y, width, height);
	}

	public static Bitmap rotate(Bitmap bitmap, float degrees) {
		if (bitmap == null) {
			return null;
		}

		bitmap = software(bitmap);

		if (degrees % 360 == 0) {
			return bitmap.copy(bitmap.getConfig() != null ? bitmap.getConfig() : Bitmap.Config.ARGB_8888, false);
		}

		Matrix matrix = new Matrix();
		matrix.setRotate(degrees);
		return Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
	}

	public static Bitmap flip(Bitmap bitmap, boolean horizontal, boolean vertical) {
		if (bitmap == null) {
			return null;
		}

		bitmap = software(bitmap);

		Matrix matrix = new Matrix();
		matrix.setScale(horizontal ? -1 : 1, vertical ? -1 : 1);
		return Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
	}

	/** Aspect-preserving downscale so the long edge is at most {@code maxSize}. Never upscales. */
	public static Bitmap resize(Bitmap bitmap, int maxSize, boolean filter) {
		if (bitmap == null) {
			return null;
		}

		bitmap = software(bitmap);

		if (maxSize <= 0) {
			throw new IllegalArgumentException("maxSize must be a positive number of pixels");
		}

		int w = bitmap.getWidth();
		int h = bitmap.getHeight();
		int tw;
		int th;
		if (h >= w) {
			if (h <= maxSize) {
				return bitmap;
			}

			th = maxSize;
			tw = Math.max(1, Math.round((float) maxSize * w / h));
		} else {
			if (w <= maxSize) {
				return bitmap;
			}

			tw = maxSize;
			th = Math.max(1, Math.round((float) maxSize * h / w));
		}

		return scaleTo(bitmap, tw, th, filter);
	}

	private static Bitmap scaleTo(Bitmap bitmap, int width, int height, boolean filter) {
		Bitmap out = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
		Canvas canvas = new Canvas(out);
		Paint paint = new Paint(filter ? Paint.FILTER_BITMAP_FLAG | Paint.ANTI_ALIAS_FLAG : 0);
		canvas.drawBitmap(bitmap, null, new Rect(0, 0, width, height), paint);
		return out;
	}

	/**
	 * Produces an exact width x height output.
	 * mode "fit": letterbox inside, padding with {@code background} (0 = transparent).
	 * mode "fill": scale to cover and centre-crop.
	 * mode "stretch": ignore aspect ratio.
	 */
	public static Bitmap resizeTo(Bitmap bitmap, int width, int height, String mode, int background) {
		if (bitmap == null) {
			return null;
		}

		bitmap = software(bitmap);

		if (width <= 0 || height <= 0) {
			throw new IllegalArgumentException("width and height must be positive");
		}

		Bitmap out = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
		Canvas canvas = new Canvas(out);
		if (background != 0) {
			canvas.drawColor(background);
		}

		Paint paint = new Paint(Paint.FILTER_BITMAP_FLAG | Paint.ANTI_ALIAS_FLAG);
		float sw = bitmap.getWidth();
		float sh = bitmap.getHeight();
		RectF dest;
		if ("stretch".equals(mode)) {
			dest = new RectF(0, 0, width, height);
		} else {
			boolean fill = "fill".equals(mode);
			float scale = fill ? Math.max(width / sw, height / sh) : Math.min(width / sw, height / sh);
			float dw = sw * scale;
			float dh = sh * scale;
			float left = (width - dw) / 2f;
			float top = (height - dh) / 2f;
			dest = new RectF(left, top, left + dw, top + dh);
		}

		canvas.drawBitmap(bitmap, null, dest, paint);
		return out;
	}

	/**
	 * Applies normalize -> crop -> rotate -> flip -> resize in one pass. Options is JSON:
	 * { crop: {x,y,width,height}, rotate: deg, flip: 'horizontal'|'vertical'|'both',
	 *   resize: { maxSize } | { width, height, mode, background } }
	 */
	public static Bitmap transform(Bitmap bitmap, int rotationAngle, String optionsJson) throws JSONException {
		if (bitmap == null) {
			return null;
		}

		bitmap = software(bitmap);

		JSONObject options = optionsJson != null ? new JSONObject(optionsJson) : new JSONObject();
		Bitmap current = applyRotation(bitmap, rotationAngle);

		JSONObject crop = options.optJSONObject("crop");
		if (crop != null) {
			current = crop(current, crop.getInt("x"), crop.getInt("y"), crop.getInt("width"), crop.getInt("height"));
		}

		if (options.has("rotate")) {
			current = rotate(current, (float) options.getDouble("rotate"));
		}

		String flip = options.optString("flip", null);
		if (flip != null && flip.length() > 0) {
			current = flip(current, "horizontal".equals(flip) || "both".equals(flip), "vertical".equals(flip) || "both".equals(flip));
		}

		JSONObject resize = options.optJSONObject("resize");
		if (resize != null) {
			if (resize.has("maxSize")) {
				current = resize(current, resize.getInt("maxSize"), true);
			} else {
				current = resizeTo(current, resize.getInt("width"), resize.getInt("height"), resize.optString("mode", "fit"), resize.optInt("background", 0));
			}
		}

		if (current == bitmap) {
			current = bitmap.copy(Bitmap.Config.ARGB_8888, false);
		}

		return current;
	}

	public static void transformAsync(final Bitmap bitmap, final int rotationAngle, final String optionsJson, final Utils.AsyncImageCallback callback) {
		runAsync(new Callable<Object>() {
			@Override
			public Object call() throws Exception {
				return transform(bitmap, rotationAngle, optionsJson);
			}
		}, callback);
	}

	// ---------------------------------------------------------------------
	// Compositing
	// ---------------------------------------------------------------------

	/** Rounded corners with the given radius; a negative radius masks to an inscribed circle. */
	public static Bitmap roundCorners(Bitmap bitmap, float radius) {
		if (bitmap == null) {
			return null;
		}

		bitmap = software(bitmap);

		int w = bitmap.getWidth();
		int h = bitmap.getHeight();
		Bitmap out = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
		Canvas canvas = new Canvas(out);
		Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG);
		paint.setShader(new BitmapShader(bitmap, Shader.TileMode.CLAMP, Shader.TileMode.CLAMP));
		if (radius < 0) {
			float r = Math.min(w, h) / 2f;
			canvas.drawCircle(w / 2f, h / 2f, r, paint);
		} else {
			canvas.drawRoundRect(new RectF(0, 0, w, h), radius, radius, paint);
		}

		return out;
	}

	public static Bitmap overlay(Bitmap base, Bitmap other, int x, int y, float opacity) {
		if (base == null) {
			return null;
		}

		Bitmap out = software(base).copy(Bitmap.Config.ARGB_8888, true);
		if (other == null) {
			return out;
		}

		other = software(other);

		Canvas canvas = new Canvas(out);
		Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG);
		paint.setAlpha(Math.round(Math.max(0f, Math.min(1f, opacity)) * 255));
		canvas.drawBitmap(other, x, y, paint);
		return out;
	}

	/** Draws text with its top-left corner at (x, y). */
	public static Bitmap drawText(Bitmap bitmap, String text, float x, float y, Typeface typeface, float textSize, int color) {
		if (bitmap == null) {
			return null;
		}

		bitmap = software(bitmap);

		Bitmap out = bitmap.copy(Bitmap.Config.ARGB_8888, true);
		Canvas canvas = new Canvas(out);
		Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG | Paint.SUBPIXEL_TEXT_FLAG);
		paint.setColor(color);
		paint.setTextSize(textSize);
		if (typeface != null) {
			paint.setTypeface(typeface);
		}

		canvas.drawText(text, x, y - paint.getFontMetrics().ascent, paint);
		return out;
	}

	public static Bitmap tint(Bitmap bitmap, int color) {
		if (bitmap == null) {
			return null;
		}

		bitmap = software(bitmap);

		Bitmap out = Bitmap.createBitmap(bitmap.getWidth(), bitmap.getHeight(), Bitmap.Config.ARGB_8888);
		Canvas canvas = new Canvas(out);
		Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
		paint.setColorFilter(new PorterDuffColorFilter(color, PorterDuff.Mode.SRC_IN));
		canvas.drawBitmap(bitmap, 0, 0, paint);
		return out;
	}

	public static Bitmap fromView(View view) {
		return Utils.getBitmapFromView(view);
	}

	// ---------------------------------------------------------------------
	// Filters
	// ---------------------------------------------------------------------

	/**
	 * Filters is a JSON array of { type, amount?, radius? }:
	 * grayscale, sepia(amount 0..1), invert, brightness(amount -1..1),
	 * contrast(amount 0..2, 1 = unchanged), saturation(amount 0..2, 1 = unchanged), blur(radius px).
	 */
	public static Bitmap applyFilters(Bitmap bitmap, String filtersJson) throws JSONException {
		if (bitmap == null) {
			return null;
		}

		bitmap = software(bitmap);
		JSONArray filters = new JSONArray(filtersJson != null ? filtersJson : "[]");
		Bitmap current = bitmap;
		ColorMatrix pending = null;

		for (int i = 0; i < filters.length(); i++) {
			JSONObject filter = filters.getJSONObject(i);
			String type = filter.getString("type");
			if ("blur".equals(type)) {
				// Colour work queued so far must land before the blur so the order the caller gave is honoured.
				current = flushColorMatrix(current, pending);
				pending = null;
				current = stackBlur(current, Math.round((float) filter.optDouble("radius", 0)));
				continue;
			}

			if (pending == null) {
				pending = new ColorMatrix();
			}

			pending.postConcat(colorMatrixFor(type, filter));
		}

		current = flushColorMatrix(current, pending);
		if (current == bitmap) {
			current = bitmap.copy(Bitmap.Config.ARGB_8888, false);
		}

		return current;
	}

	private static Bitmap flushColorMatrix(Bitmap source, ColorMatrix matrix) {
		if (matrix == null) {
			return source;
		}

		Bitmap out = Bitmap.createBitmap(source.getWidth(), source.getHeight(), Bitmap.Config.ARGB_8888);
		Canvas canvas = new Canvas(out);
		Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
		paint.setColorFilter(new ColorMatrixColorFilter(matrix));
		canvas.drawBitmap(source, 0, 0, paint);
		return out;
	}

	private static ColorMatrix colorMatrixFor(String type, JSONObject filter) {
		switch (type) {
			case "grayscale": {
				ColorMatrix m = new ColorMatrix();
				m.setSaturation(0);
				return m;
			}
			case "sepia": {
				float a = (float) filter.optDouble("amount", 1.0);
				// Blend identity with the classic sepia matrix.
				float[] sepia = {
						0.393f, 0.769f, 0.189f, 0, 0,
						0.349f, 0.686f, 0.168f, 0, 0,
						0.272f, 0.534f, 0.131f, 0, 0,
						0, 0, 0, 1, 0};
				float[] identity = {1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0};
				float[] mixed = new float[20];
				for (int k = 0; k < 20; k++) {
					mixed[k] = identity[k] + (sepia[k] - identity[k]) * a;
				}

				return new ColorMatrix(mixed);
			}
			case "invert":
				return new ColorMatrix(new float[]{
						-1, 0, 0, 0, 255,
						0, -1, 0, 0, 255,
						0, 0, -1, 0, 255,
						0, 0, 0, 1, 0});
			case "brightness": {
				float b = (float) filter.optDouble("amount", 0) * 255f;
				return new ColorMatrix(new float[]{
						1, 0, 0, 0, b,
						0, 1, 0, 0, b,
						0, 0, 1, 0, b,
						0, 0, 0, 1, 0});
			}
			case "contrast": {
				float c = (float) filter.optDouble("amount", 1);
				float t = (1f - c) * 127.5f;
				return new ColorMatrix(new float[]{
						c, 0, 0, 0, t,
						0, c, 0, 0, t,
						0, 0, c, 0, t,
						0, 0, 0, 1, 0});
			}
			case "saturation": {
				ColorMatrix m = new ColorMatrix();
				m.setSaturation((float) filter.optDouble("amount", 1));
				return m;
			}
			default:
				throw new IllegalArgumentException("Unknown filter type '" + type + "'");
		}
	}

	public static void applyFiltersAsync(final Bitmap bitmap, final String filtersJson, final Utils.AsyncImageCallback callback) {
		runAsync(new Callable<Object>() {
			@Override
			public Object call() throws Exception {
				return applyFilters(bitmap, filtersJson);
			}
		}, callback);
	}

	/**
	 * Stack blur (Mario Klingemann). A close gaussian approximation that runs on
	 * the CPU on every API level, so results are deterministic across devices.
	 */
	public static Bitmap stackBlur(Bitmap source, int radius) {
		if (source == null) {
			return null;
		}

		if (radius < 1) {
			return source.copy(Bitmap.Config.ARGB_8888, false);
		}

		Bitmap bitmap = software(source).copy(Bitmap.Config.ARGB_8888, true);
		int w = bitmap.getWidth();
		int h = bitmap.getHeight();
		int[] pix = new int[w * h];
		bitmap.getPixels(pix, 0, w, 0, 0, w, h);

		// Blur premultiplied colour so transparent neighbours do not bleed dark fringes.
		for (int i = 0; i < pix.length; i++) {
			int p = pix[i];
			int a = p >>> 24;
			if (a == 255) {
				continue;
			}

			int pr = ((p >> 16) & 0xff) * a / 255;
			int pg = ((p >> 8) & 0xff) * a / 255;
			int pb = (p & 0xff) * a / 255;
			pix[i] = (a << 24) | (pr << 16) | (pg << 8) | pb;
		}

		int wm = w - 1;
		int hm = h - 1;
		int wh = w * h;
		int div = radius + radius + 1;

		int[] r = new int[wh];
		int[] g = new int[wh];
		int[] b = new int[wh];
		int[] a = new int[wh];
		int rsum, gsum, bsum, asum, x, y, i, p, yp, yi, yw;
		int[] vmin = new int[Math.max(w, h)];

		int divsum = (div + 1) >> 1;
		divsum *= divsum;
		int[] dv = new int[256 * divsum];
		for (i = 0; i < 256 * divsum; i++) {
			dv[i] = (i / divsum);
		}

		yw = yi = 0;

		int[][] stack = new int[div][4];
		int stackpointer;
		int stackstart;
		int[] sir;
		int rbs;
		int r1 = radius + 1;
		int routsum, goutsum, boutsum, aoutsum;
		int rinsum, ginsum, binsum, ainsum;

		for (y = 0; y < h; y++) {
			rinsum = ginsum = binsum = ainsum = routsum = goutsum = boutsum = aoutsum = rsum = gsum = bsum = asum = 0;
			for (i = -radius; i <= radius; i++) {
				p = pix[yi + Math.min(wm, Math.max(i, 0))];
				sir = stack[i + radius];
				sir[0] = (p & 0xff0000) >> 16;
				sir[1] = (p & 0x00ff00) >> 8;
				sir[2] = (p & 0x0000ff);
				sir[3] = (p >>> 24);
				rbs = r1 - Math.abs(i);
				rsum += sir[0] * rbs;
				gsum += sir[1] * rbs;
				bsum += sir[2] * rbs;
				asum += sir[3] * rbs;
				if (i > 0) {
					rinsum += sir[0];
					ginsum += sir[1];
					binsum += sir[2];
					ainsum += sir[3];
				} else {
					routsum += sir[0];
					goutsum += sir[1];
					boutsum += sir[2];
					aoutsum += sir[3];
				}
			}

			stackpointer = radius;

			for (x = 0; x < w; x++) {
				r[yi] = dv[rsum];
				g[yi] = dv[gsum];
				b[yi] = dv[bsum];
				a[yi] = dv[asum];

				rsum -= routsum;
				gsum -= goutsum;
				bsum -= boutsum;
				asum -= aoutsum;

				stackstart = stackpointer - radius + div;
				sir = stack[stackstart % div];

				routsum -= sir[0];
				goutsum -= sir[1];
				boutsum -= sir[2];
				aoutsum -= sir[3];

				if (y == 0) {
					vmin[x] = Math.min(x + radius + 1, wm);
				}

				p = pix[yw + vmin[x]];

				sir[0] = (p & 0xff0000) >> 16;
				sir[1] = (p & 0x00ff00) >> 8;
				sir[2] = (p & 0x0000ff);
				sir[3] = (p >>> 24);

				rinsum += sir[0];
				ginsum += sir[1];
				binsum += sir[2];
				ainsum += sir[3];

				rsum += rinsum;
				gsum += ginsum;
				bsum += binsum;
				asum += ainsum;

				stackpointer = (stackpointer + 1) % div;
				sir = stack[(stackpointer) % div];

				routsum += sir[0];
				goutsum += sir[1];
				boutsum += sir[2];
				aoutsum += sir[3];

				rinsum -= sir[0];
				ginsum -= sir[1];
				binsum -= sir[2];
				ainsum -= sir[3];

				yi++;
			}

			yw += w;
		}

		for (x = 0; x < w; x++) {
			rinsum = ginsum = binsum = ainsum = routsum = goutsum = boutsum = aoutsum = rsum = gsum = bsum = asum = 0;
			yp = -radius * w;
			for (i = -radius; i <= radius; i++) {
				yi = Math.max(0, yp) + x;

				sir = stack[i + radius];

				sir[0] = r[yi];
				sir[1] = g[yi];
				sir[2] = b[yi];
				sir[3] = a[yi];

				rbs = r1 - Math.abs(i);

				rsum += r[yi] * rbs;
				gsum += g[yi] * rbs;
				bsum += b[yi] * rbs;
				asum += a[yi] * rbs;

				if (i > 0) {
					rinsum += sir[0];
					ginsum += sir[1];
					binsum += sir[2];
					ainsum += sir[3];
				} else {
					routsum += sir[0];
					goutsum += sir[1];
					boutsum += sir[2];
					aoutsum += sir[3];
				}

				if (i < hm) {
					yp += w;
				}
			}

			yi = x;
			stackpointer = radius;
			for (y = 0; y < h; y++) {
				pix[yi] = (dv[asum] << 24) | (dv[rsum] << 16) | (dv[gsum] << 8) | dv[bsum];

				rsum -= routsum;
				gsum -= goutsum;
				bsum -= boutsum;
				asum -= aoutsum;

				stackstart = stackpointer - radius + div;
				sir = stack[stackstart % div];

				routsum -= sir[0];
				goutsum -= sir[1];
				boutsum -= sir[2];
				aoutsum -= sir[3];

				if (x == 0) {
					vmin[y] = Math.min(y + r1, hm) * w;
				}

				p = x + vmin[y];

				sir[0] = r[p];
				sir[1] = g[p];
				sir[2] = b[p];
				sir[3] = a[p];

				rinsum += sir[0];
				ginsum += sir[1];
				binsum += sir[2];
				ainsum += sir[3];

				rsum += rinsum;
				gsum += ginsum;
				bsum += binsum;
				asum += ainsum;

				stackpointer = (stackpointer + 1) % div;
				sir = stack[stackpointer];

				routsum += sir[0];
				goutsum += sir[1];
				boutsum += sir[2];
				aoutsum += sir[3];

				rinsum -= sir[0];
				ginsum -= sir[1];
				binsum -= sir[2];
				ainsum -= sir[3];

				yi += w;
			}
		}

		for (int idx = 0; idx < pix.length; idx++) {
			int px = pix[idx];
			int alpha = px >>> 24;
			if (alpha == 255 || alpha == 0) {
				continue;
			}

			int ur = Math.min(255, ((px >> 16) & 0xff) * 255 / alpha);
			int ug = Math.min(255, ((px >> 8) & 0xff) * 255 / alpha);
			int ub = Math.min(255, (px & 0xff) * 255 / alpha);
			pix[idx] = (alpha << 24) | (ur << 16) | (ug << 8) | ub;
		}

		bitmap.setPixels(pix, 0, w, 0, 0, w, h);
		return bitmap;
	}

	// ---------------------------------------------------------------------
	// Analysis
	// ---------------------------------------------------------------------

	private static final int SAMPLE_SIZE = 32;

	private static int[] samplePixels(Bitmap bitmap) {
		Bitmap small = resizeTo(software(bitmap), SAMPLE_SIZE, SAMPLE_SIZE, "stretch", 0);
		int[] pixels = new int[SAMPLE_SIZE * SAMPLE_SIZE];
		small.getPixels(pixels, 0, SAMPLE_SIZE, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
		return pixels;
	}

	/** Average colour as ARGB int (alpha weighted out; fully transparent pixels ignored). */
	public static int averageColor(Bitmap bitmap) {
		if (bitmap == null) {
			return 0;
		}

		long r = 0, g = 0, b = 0, n = 0;
		for (int p : samplePixels(bitmap)) {
			if ((p >>> 24) == 0) {
				continue;
			}

			r += (p >> 16) & 0xff;
			g += (p >> 8) & 0xff;
			b += p & 0xff;
			n++;
		}

		if (n == 0) {
			return 0;
		}

		return Color.argb(255, (int) (r / n), (int) (g / n), (int) (b / n));
	}

	/** Most frequent colours (quantized to 4 bits per channel, then averaged per bucket), most common first. */
	public static int[] dominantColors(Bitmap bitmap, int count) {
		if (bitmap == null || count <= 0) {
			return new int[0];
		}

		Map<Integer, long[]> buckets = new HashMap<>();
		for (int p : samplePixels(bitmap)) {
			if ((p >>> 24) < 128) {
				continue;
			}

			int r = (p >> 16) & 0xff;
			int g = (p >> 8) & 0xff;
			int b = p & 0xff;
			int key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
			long[] acc = buckets.get(key);
			if (acc == null) {
				acc = new long[4];
				buckets.put(key, acc);
			}

			acc[0] += r;
			acc[1] += g;
			acc[2] += b;
			acc[3]++;
		}

		long[][] entries = buckets.values().toArray(new long[0][]);
		Arrays.sort(entries, new Comparator<long[]>() {
			@Override
			public int compare(long[] a, long[] b) {
				return Long.compare(b[3], a[3]);
			}
		});
		int n = Math.min(count, entries.length);
		int[] result = new int[n];
		for (int i = 0; i < n; i++) {
			long[] e = entries[i];
			result[i] = Color.argb(255, (int) (e[0] / e[3]), (int) (e[1] / e[3]), (int) (e[2] / e[3]));
		}

		return result;
	}

	/**
	 * Difference hash: 9x8 grayscale, each bit = left pixel brighter than right.
	 * Returned as 16 hex characters. Same algorithm as the iOS implementation.
	 */
	public static String perceptualHash(Bitmap bitmap) {
		if (bitmap == null) {
			return null;
		}

		Bitmap small = resizeTo(software(bitmap), 9, 8, "stretch", 0);
		int[] px = new int[72];
		small.getPixels(px, 0, 9, 0, 0, 9, 8);
		long hash = 0;
		for (int y = 0; y < 8; y++) {
			for (int x = 0; x < 8; x++) {
				int left = px[y * 9 + x];
				int right = px[y * 9 + x + 1];
				hash = (hash << 1) | (luma(left) > luma(right) ? 1 : 0);
			}
		}

		return String.format(Locale.US, "%016x", hash);
	}

	private static int luma(int argb) {
		int r = (argb >> 16) & 0xff;
		int g = (argb >> 8) & 0xff;
		int b = argb & 0xff;
		return (r * 299 + g * 587 + b * 114) / 1000;
	}

	public static int hammingDistance(String a, String b) {
		if (a == null || b == null || a.length() != 16 || b.length() != 16) {
			return -1;
		}

		long x = Long.parseUnsignedLong(a, 16) ^ Long.parseUnsignedLong(b, 16);
		return Long.bitCount(x);
	}
}

package org.nativescript.widgets;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.provider.MediaStore;
import android.webkit.MimeTypeMap;

import androidx.annotation.Nullable;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class FileHelper {
	private Uri uri;
	private long size;
	private String name;
	private String mime;
	private long lastModified;
	private ExecutorService executor = Executors.newSingleThreadExecutor();
	private Handler handler;

	public interface Callback {
		void onError(Exception exception);

		void onSuccess(@Nullable Object result);
	}

	FileHelper(Uri uri) {
		handler = new Handler(Looper.getMainLooper());
		this.uri = uri;
	}

	public static boolean exists(Context context, String string) {
		try {
			return exists(context, Uri.parse(string));
		} catch (Exception ignored) {
			return false;
		}
	}

	public static boolean exists(Context context, Uri uri) {
		Cursor cursor = context.getContentResolver()
			.query(uri, null, null, null, null);

		boolean exists = cursor.moveToFirst();
		cursor.close();
		return exists;
	}

	public static @Nullable
	FileHelper fromString(Context context, String string) {
		try {
			return fromUri(context, Uri.parse(string));
		} catch (Exception ignored) {
			return null;
		}

	}

	public static @Nullable
	FileHelper fromUri(Context context, Uri uri) {
		Cursor cursor = context.getContentResolver()
			.query(uri, null, null, null, null);

		int sizeIndex = cursor.getColumnIndex(
			MediaStore.MediaColumns.SIZE
		);

		int nameIndex = cursor.getColumnIndex(
			MediaStore.MediaColumns.DISPLAY_NAME
		);

		int lastModifiedIndex = cursor.getColumnIndex(
			MediaStore.MediaColumns.DATE_MODIFIED
		);


		boolean moved = cursor.moveToFirst();

		if (!moved) {
			return null;
		}
		FileHelper helper = new FileHelper(uri);
		helper.size = cursor.getLong(sizeIndex);
		helper.name = cursor.getString(nameIndex);
		helper.mime = context.getContentResolver().getType(uri);
		helper.lastModified = cursor.getLong(lastModifiedIndex);
		cursor.close();
		return helper;
	}

	private void updateInternal(Context context) {
		updateInternal(context, true);
	}

	private void updateInternal(Context context, boolean force) {

		if (force) {
			// trigger db update
			ContentValues values = new ContentValues();
			if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
				context.getContentResolver().update(uri, values, null);
			} else {
				context.getContentResolver().update(uri, values, null, null);
			}
		}

		Cursor cursor = context.getContentResolver()
			.query(uri, null, null, null, null);

		int sizeIndex = cursor.getColumnIndex(
			MediaStore.MediaColumns.SIZE
		);

		int nameIndex = cursor.getColumnIndex(
			MediaStore.MediaColumns.DISPLAY_NAME
		);

		int lastModifiedIndex = cursor.getColumnIndex(
			MediaStore.MediaColumns.DATE_MODIFIED
		);


		boolean moved = cursor.moveToFirst();

		if (!moved) {
			return;
		}
		size = cursor.getLong(sizeIndex);
		name = cursor.getString(nameIndex);
		mime = context.getContentResolver().getType(uri);
		lastModified = cursor.getLong(lastModifiedIndex);
		cursor.close();
	}

	public long getSize() {
		return size;
	}

	public String getName() {
		return name;
	}

	public String getMime() {
		if (mime == null) {
			return "application/octet-stream";
		}
		return mime;
	}

	public String getExtension() {
		if (mime == null) {
			return "";
		}
		return MimeTypeMap.getSingleton().getExtensionFromMimeType(mime);
	}

	public long getLastModified() {
		return lastModified;
	}

	private byte[] readSyncInternal(Context context) throws Exception {
		InputStream is = context.getContentResolver().openInputStream(uri);
		byte[] array = new byte[(int) size];
		is.read(array);
		is.close();
		return array;
	}

	public @Nullable
	byte[] readSync(Context context, @Nullable Callback callback) {
		try {
			return readSyncInternal(context);
		} catch (Exception e) {
			if (callback != null) {
				callback.onError(e);
			}
		}
		return null;
	}

	public void read(Context context, Callback callback) {
		executor.execute(() -> {
			try {
				byte[] result = readSyncInternal(context);
				handler.post(() -> callback.onSuccess(result));
			} catch (Exception e) {
				handler.post(() -> callback.onError(e));
			}
		});
	}

	private String readTextSyncInternal(Context context, @Nullable String encoding) throws Exception {
		String characterSet = encoding;
		if (characterSet == null) {
			characterSet = "UTF-8";
		}

		InputStream is = context.getContentResolver().openInputStream(uri);
		InputStreamReader isr = new InputStreamReader(is, characterSet);
		BufferedReader reader = new BufferedReader(isr);
		char[] buf = new char[is.available()];
		reader.read(buf);
		reader.close();
		return new String(buf);
	}

	public String readTextSync(Context context, @Nullable String encoding, @Nullable Callback callback) {
		try {
			return readTextSyncInternal(context, encoding);
		} catch (Exception e) {
			if (callback != null) {
				callback.onError(e);
			}
		}
		return null;
	}

	public void readText(Context context, @Nullable String encoding, Callback callback) {
		executor.execute(() -> {
			try {
				String result = readTextSyncInternal(context, encoding);
				handler.post(() -> callback.onSuccess(result));
			} catch (Exception e) {
				handler.post(() -> callback.onError(e));
			}
		});
	}

	private void writeSyncInternal(Context context, byte[] content) throws Exception {
		OutputStream os = context.getContentResolver().openOutputStream(uri);
		os.write(content, 0, content.length);
		os.flush();
		os.close();
		updateInternal(context);
	}

	public void writeSync(Context context, byte[] content, @Nullable Callback callback) {
		try {
			writeSyncInternal(context, content);
		} catch (Exception e) {
			if (callback != null) {
				callback.onError(e);
			}
		}
	}

	public void write(Context context, byte[] content, Callback callback) {
		executor.execute(() -> {
			try {
				writeSyncInternal(context, content);
				handler.post(() -> callback.onSuccess(null));
			} catch (Exception e) {
				handler.post(() -> callback.onError(e));
			}
		});
	}

	private void writeTextSyncInternal(Context context, String content, @Nullable String encoding) throws Exception {
		OutputStream os = context.getContentResolver().openOutputStream(uri);
		String characterSet = encoding;
		if (characterSet == null) {
			characterSet = "UTF-8";
		}
		OutputStreamWriter osw = new OutputStreamWriter(os, characterSet);
		osw.write(content);
		osw.flush();
		osw.close();
		updateInternal(context);
	}

	public void writeTextSync(Context context, String content, @Nullable String encoding, @Nullable Callback callback) {
		try {
			writeTextSyncInternal(context, content, encoding);
		} catch (Exception e) {
			if (callback != null) {
				callback.onError(e);
			}
		}
	}

	public void writeText(Context context, String content, @Nullable String encoding, Callback callback) {
		executor.execute(() -> {
			try {
				writeTextSyncInternal(context, content, encoding);
				handler.post(() -> callback.onSuccess(null));
			} catch (Exception e) {
				handler.post(() -> callback.onError(e));
			}
		});
	}

	private void copyToFileInternal(InputStream is, OutputStream os) throws Exception {
		int read;
		byte[] buf = new byte[1024];
		while ((read = is.read(buf)) != -1) {
			os.write(buf, 0, read);
		}
		is.close();
		os.flush();
		os.close();
	}

	private void copyToFileInternal(Context context, File file) throws Exception {
		InputStream is = context.getContentResolver().openInputStream(uri);
		FileOutputStream os = new FileOutputStream(file);
		copyToFileInternal(is, os);
	}

	public boolean copyToFileSync(Context context, File file, @Nullable Callback callback) {
		boolean completed = false;
		try {
			copyToFileInternal(context, file);
			completed = true;
		} catch (Exception e) {
			if (callback != null) {
				callback.onError(e);
			}
		}
		return completed;
	}

	public void copyToFile(Context context, File file, Callback callback) {
		executor.execute(() -> {
			try {
				copyToFileInternal(context, file);
				handler.post(() -> callback.onSuccess(true));
			} catch (Exception e) {
				handler.post(() -> callback.onError(e));
			}
		});
	}

	public boolean delete(Context context) {
		try {
			return context.getContentResolver().delete(uri, null, null) > 0;
		} catch (SecurityException e) {
			return false;
		}
	}

	private void renameInternal(Context context, String newName) throws Exception {
		ContentValues values = new ContentValues();
		values.put(MediaStore.MediaColumns.DISPLAY_NAME, newName);

		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
			context.getContentResolver().update(uri, values, null);
		} else {
			context.getContentResolver().update(uri, values, null, null);
		}

		updateInternal(context, false);
	}

	public void renameSync(Context context, String newName, @Nullable Callback callback) {
		try {
			renameInternal(context, newName);
		} catch (Exception e) {
			if (callback != null) {
				callback.onError(e);
			}
		}
	}


	public void rename(Context context, String newName, Callback callback) {
		executor.execute(() -> {
			try {
				renameInternal(context, newName);
				handler.post(() -> callback.onSuccess(null));
			} catch (Exception e) {
				handler.post(() -> callback.onError(e));
			}
		});
	}

}

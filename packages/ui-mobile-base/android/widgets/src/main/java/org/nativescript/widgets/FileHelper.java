package org.nativescript.widgets;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.DocumentsContract;
import android.provider.MediaStore;
import android.webkit.MimeTypeMap;

import androidx.annotation.Nullable;
import androidx.documentfile.provider.DocumentFile;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
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

	private static boolean isExternalStorageDocument(Uri uri) {
		return false;
//		return "com.android.externalstorage.documents".equals(uri
//			.getAuthority());
	}

	private static @Nullable
	Cursor getCursor(Context context, Uri uri) {
		Cursor cursor = null;
		String[] projections = {
			MediaStore.MediaColumns.SIZE,
			MediaStore.MediaColumns.DISPLAY_NAME,
			MediaStore.MediaColumns.DATE_MODIFIED
		};
		try {
			if (Build.VERSION.SDK_INT >= 19) {
				if (DocumentsContract.isDocumentUri(context, uri)) {
					if (Build.VERSION.SDK_INT >= 29) {
						if (!uri.toString().startsWith("content://com.android.providers.downloads.documents")) {
							cursor = context.getContentResolver().query(
								MediaStore.getMediaUri(context, uri), projections, null, null, null, null
							);
						}
					}
				}
			}
			if (cursor == null) {
				cursor = context.getContentResolver().query(uri, projections, null, null, null);
			}
		} catch (Exception ignored) {
		}

		return cursor;

	}

	public static boolean exists(Context context, String string) {
		try {
			return exists(context, Uri.parse(string));
		} catch (Exception ignored) {
			return false;
		}
	}

	public static boolean exists(Context context, Uri uri) {
		if (Build.VERSION.SDK_INT >= 19 && isExternalStorageDocument(uri)) {
			File file = getFile(context, uri);
			if (file != null) {
				return file.exists();
			}
			return false;
		}
		Cursor cursor = getCursor(context, uri);
		if (cursor == null) {
			return false;
		}
		boolean exists = cursor.moveToFirst();
		cursor.close();
		return exists;
	}

	public static @Nullable
	FileHelper fromString(Context context, String string) {
		try {
			return fromUri(context, Uri.parse(string));
		} catch (Exception e) {
			return null;
		}
	}

	@SuppressWarnings("deprecation")
	private static @Nullable
	File getFile(Context context, Uri uri) {
		if (Build.VERSION.SDK_INT >= 19) {
			String docId = DocumentsContract.getDocumentId(uri);
			String[] split = docId.split(":");
			String type = split[0];
			String path = split[1];

			if ("primary".equals(type)) {
				String[] parts = Uri.decode(uri.toString()).split(":" + path + "/");
				String file = Environment.getExternalStorageDirectory() + "/" + path + "/" + parts[1];
				return new File(file);
			} else {
				File[] cacheDirs = context.getExternalCacheDirs();
				String storageDir = null;
				for (File cacheDir : cacheDirs) {
					final String cachePath = cacheDir.getPath();
					int index = cachePath.indexOf(type);
					if (index >= 0) {
						storageDir = cachePath.substring(0, index + type.length());
					}
				}

				if (storageDir != null) {
					return new File(storageDir + "/" + path);
				}
			}
		}
		return null;
	}


	public static @Nullable
	FileHelper fromUri(Context context, Uri contentUri) {
		Uri uri = contentUri;

		if (Build.VERSION.SDK_INT >= 19 && isExternalStorageDocument(uri)) {
			File file = getFile(context, uri);
			if (file == null) {
				return null;
			}
			FileHelper helper = new FileHelper(uri);
			helper.size = file.length();
			helper.name = file.getName();
			helper.mime = context.getContentResolver().getType(uri);
			helper.lastModified = file.lastModified() / 1000;
			return helper;
		}

		Cursor cursor = getCursor(context, uri);

		if (cursor == null) {
			return null;
		}

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
		FileHelper helper = null;
		if (moved) {
			helper = new FileHelper(uri);
			helper.size = cursor.getLong(sizeIndex);
			helper.name = cursor.getString(nameIndex);
			helper.mime = context.getContentResolver().getType(uri);
			helper.lastModified = cursor.getLong(lastModifiedIndex);
		}
		cursor.close();
		return helper;
	}

	private void updateInternal(Context context) {
		updateInternal(context, true);
	}


	private void updateValue(Context context, Uri uri, ContentValues values) {
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
			context.getContentResolver().update(uri, values, null);
		} else {
			context.getContentResolver().update(uri, values, null, null);
		}
	}

	private void updateInternal(Context context, boolean force) {

		if (force) {
			// trigger db update
			ContentValues values = new ContentValues();
			if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
				if (isExternalStorageDocument(uri)) {
					return;
				}
				if (DocumentsContract.isDocumentUri(context, uri)) {
					DocumentFile file = DocumentFile.fromSingleUri(context, uri);
					if (file != null) {
						updateValue(context, file.getUri(), values);
					}
				} else {
					updateValue(context, uri, values);
				}
			} else {
				updateValue(context, uri, values);
			}
		}

		Cursor cursor = getCursor(context, uri);
		if (cursor == null) {
			return;
		}

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

		if (moved) {
			size = cursor.getLong(sizeIndex);
			name = cursor.getString(nameIndex);
			mime = context.getContentResolver().getType(uri);
			lastModified = cursor.getLong(lastModifiedIndex);
		}

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

	private InputStream getInputStream(Context context, Uri uri) throws Exception {
		if (Build.VERSION.SDK_INT >= 19) {
			if (isExternalStorageDocument(uri)) {
				File file = getFile(context, uri);
				return new FileInputStream(file);
			}
			if (DocumentsContract.isDocumentUri(context, uri)) {
				return context.getContentResolver().openInputStream(DocumentFile.fromSingleUri(context, uri).getUri());
			}
		}
		return context.getContentResolver().openInputStream(uri);
	}


	private OutputStream getOutputStream(Context context, Uri uri) throws Exception {
		if (Build.VERSION.SDK_INT >= 19) {
			if (isExternalStorageDocument(uri)) {
				File file = getFile(context, uri);
				return new FileOutputStream(file);
			}
			if (DocumentsContract.isDocumentUri(context, uri)) {
				return context.getContentResolver().openOutputStream(DocumentFile.fromSingleUri(context, uri).getUri());
			}
		}
		return context.getContentResolver().openOutputStream(uri);
	}

	private byte[] readSyncInternal(Context context) throws Exception {
		InputStream is = getInputStream(context, uri);

		Async.Http.RequestResult.ByteArrayOutputStream2 ret = new Async.Http.RequestResult.ByteArrayOutputStream2();

		byte[] buff = new byte[4096];
		int read;
		while ((read = is.read(buff, 0, buff.length)) != -1) {
			ret.write(buff, 0, read);
		}

		is.close();
		return ret.buf();
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

		InputStream is = getInputStream(context, uri);
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
		OutputStream os = getOutputStream(context, uri);
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
		OutputStream os = getOutputStream(context, uri);
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
		InputStream is = getInputStream(context, uri);
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
			if (Build.VERSION.SDK_INT >= 19) {
				if (isExternalStorageDocument(uri)) {
					File file = getFile(context, uri);
					if (file != null) {
						return file.delete();
					}
					return false;
				} else {
					if (DocumentsContract.isDocumentUri(context, uri)) {
						if (Build.VERSION.SDK_INT >= 29) {
							if (!uri.toString().startsWith("content://com.android.providers.downloads.documents")) {
								return context.getContentResolver().delete(
									MediaStore.getMediaUri(context, uri), null, null
								) > 0;
							}

						} else {
							return DocumentsContract.deleteDocument(context.getContentResolver(), uri);
						}
					}
				}
			}
			return context.getContentResolver().delete(uri, null, null) > 0;
		} catch (SecurityException | FileNotFoundException e) {
			return false;
		}
	}


	private void renameInternal(Context context, String newName) throws Exception {
		ContentValues values = new ContentValues();
		values.put(MediaStore.MediaColumns.DISPLAY_NAME, newName);

		if (Build.VERSION.SDK_INT >= 19) {
			if (isExternalStorageDocument(uri)) {
				File file = getFile(context, uri);
				if (file != null) {
					file.renameTo(new File(file.getParentFile(), newName));
					return;
				}
				return;
			}

			if (DocumentsContract.isDocumentUri(context, uri)) {
				if (Build.VERSION.SDK_INT >= 29) {
					if (!uri.toString().startsWith("content://com.android.providers.downloads.documents")) {
						context.getContentResolver().update(
							uri, values, null, null
						);
						return;
					}
					DocumentsContract.renameDocument(context.getContentResolver(), uri, newName);
				} else if (Build.VERSION.SDK_INT >= 21) {
					DocumentsContract.renameDocument(context.getContentResolver(), uri, newName);
					return;
				}
			}

		}

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

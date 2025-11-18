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
import android.util.Log;

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
import java.io.StringWriter;
import java.lang.ref.WeakReference;
import java.nio.ByteBuffer;
import java.nio.channels.Channels;
import java.nio.channels.FileChannel;
import java.nio.channels.ReadableByteChannel;
import java.nio.channels.WritableByteChannel;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class FileHelper {
	static final String TAG = "FileHelper";
	private Uri uri;
	private final ExecutorService executor = Executors.newSingleThreadExecutor();
	private final Handler handler;


	private DocumentFile documentFile;

	private WeakReference<Context> context;

	public interface Callback {
		void onError(Exception exception);

		void onSuccess(@Nullable Object result);
	}

	FileHelper(Context context, Uri uri) {
		handler = new Handler(Looper.myLooper());
		this.context = new WeakReference<>(context);
		this.uri = uri;
		if (DocumentFile.isDocumentUri(context, uri)) {
			documentFile = DocumentFile.fromSingleUri(context, uri);
		}
	}

	private static boolean isExternalStorageDocument(Uri uri) {
		return "com.android.externalstorage.documents".equals(uri
			.getAuthority());
	}

	private static @Nullable
	Cursor getCursor(Context context, Uri uri) {
		return getCursor(context, uri, new String[]{
			MediaStore.MediaColumns.DISPLAY_NAME,
			MediaStore.MediaColumns.DATE_MODIFIED,
			MediaStore.MediaColumns.SIZE
		});
	}

	private static @Nullable
	Cursor getCursor(Context context, Uri uri, String[] projections) {
		Cursor cursor = null;
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

	static File getDocumentFile(Context context, Uri uri) {
		if (Build.VERSION.SDK_INT >= 19 && DocumentsContract.isDocumentUri(context, uri)) {
			return getFile(context, uri);
		}
		return null;
	}

	public static boolean exists(Context context, Uri uri) {
		if (Build.VERSION.SDK_INT >= 19) {
			if (DocumentsContract.isDocumentUri(context, uri)) {
				DocumentFile file = DocumentFile.fromSingleUri(context, uri);
				if (file != null) {
					return file.exists();
				}
			}
			File file = getDocumentFile(context, uri);
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
		return fromUri(context, Uri.parse(string));
	}

	@SuppressWarnings("deprecation")
	private static @Nullable
	File getFile(Context context, Uri uri) {
		if (Build.VERSION.SDK_INT >= 19) {
			if (isExternalStorageDocument(uri)) {
				String docId = DocumentsContract.getDocumentId(uri);
				String[] split = docId.split(":");
				String type = split[0];
				String path = split[1];

				if ("primary".equals(type)) {
					int nameIndex = path.lastIndexOf("/");
					String seg = path.substring(0, nameIndex);
					String[] parts = Uri.decode(uri.toString()).split(":" + seg);
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
		}
		return null;
	}

	public static @Nullable
	FileHelper fromUri(Context context, Uri contentUri) {
		return new FileHelper(context, contentUri);
	}

	private long getFileSize() {
		if (documentFile != null) {
			return documentFile.length();
		}
		Context context = this.context.get();
		if (context == null) {
			return 0;
		}
		if (Build.VERSION.SDK_INT >= 19 && DocumentsContract.isDocumentUri(context, uri)) {
			File file = getDocumentFile(context, uri);
			if (file == null) {
				return 0;
			}
			return file.length();
		}

		Cursor cursor = getCursor(context, uri, null);

		if (cursor == null) {
			return 0;
		}

		long size = 0;

		boolean moved = cursor.moveToFirst();
		if (moved) {
			int sizeIndex = cursor.getColumnIndex(
				MediaStore.MediaColumns.SIZE
			);

			size = cursor.getLong(sizeIndex);

		}
		cursor.close();

		return size;
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
	}

	public long getSize() {
		return getFileSize();
	}

	public String getName() {
		if (documentFile != null) {
			return documentFile.getName();
		}

		String name = null;

		Context context = this.context.get();
		if (context != null) {
			if (DocumentFile.isDocumentUri(context, uri)) {
				File file = getDocumentFile(context, uri);
				if (file != null) {
					name = file.getName();
				}
			} else {

				Cursor cursor = getCursor(context, uri, null);

				if (cursor == null) {
					return null;
				}

				boolean moved = cursor.moveToFirst();
				if (moved) {
					int nameIndex = cursor.getColumnIndex(
						MediaStore.MediaColumns.DISPLAY_NAME
					);

					name = cursor.getString(nameIndex);

				}
				cursor.close();

				return name;
			}
		}

		return name;
	}

	public String getMime() {
		String mime = null;

		Context context = this.context.get();
		if (context != null) {
			mime = context.getContentResolver().getType(uri);
		}

		if (mime == null) {
			return "application/octet-stream";
		}
		return mime;
	}

	public String getExtension() {
		String mime = getMime();
		if (mime == null) {
			return "";
		}
		return MimeTypeMap.getSingleton().getExtensionFromMimeType(mime);
	}

	public long getLastModified() {
		long lastModified = 0;
		if (documentFile != null) {
			return documentFile.lastModified();
		}
		Context context = this.context.get();
		if (context != null) {
			if (DocumentFile.isDocumentUri(context, uri)) {
				File file = getDocumentFile(context, uri);
				if (file != null) {
					lastModified = file.lastModified() / 1000;
				}
			} else {
				Cursor cursor = getCursor(context, uri, null);

				if (cursor == null) {
					return 0;
				}

				boolean moved = cursor.moveToFirst();
				if (moved) {
					int sizeIndex = cursor.getColumnIndex(
						MediaStore.MediaColumns.DATE_MODIFIED
					);

					lastModified = cursor.getLong(sizeIndex);

				}
				cursor.close();
			}
		}

		return lastModified;
	}

	private InputStream getInputStream(Context context, Uri uri) throws Exception {
		if (Build.VERSION.SDK_INT >= 19) {
			if (DocumentsContract.isDocumentUri(context, uri)) {
				return context.getContentResolver().openInputStream(DocumentFile.fromSingleUri(context, uri).getUri());
			}
			if (isExternalStorageDocument(uri)) {
				File file = getFile(context, uri);
				return new FileInputStream(file);
			}
		}
		return context.getContentResolver().openInputStream(uri);
	}

	private OutputStream getOutputStream(Context context, Uri uri) throws Exception {
		return getOutputStream(context, uri, false);
	}

	private OutputStream getOutputStream(Context context, Uri uri, boolean append) throws Exception {
		if (Build.VERSION.SDK_INT >= 19) {
			if (DocumentsContract.isDocumentUri(context, uri)) {
				return context.getContentResolver().openOutputStream(DocumentFile.fromSingleUri(context, uri).getUri(), append ? "wa" : "w");
			}
			if (isExternalStorageDocument(uri)) {
				File file = getFile(context, uri);
				return new FileOutputStream(file, append);
			}
		}
		return context.getContentResolver().openOutputStream(uri, append ? "wa" : "w");
	}

	public void appendSync(Context context, byte[] content, @Nullable Callback callback) {
		try {
			writeSyncInternal(context, content, true);
		} catch (Exception e) {
			if (callback != null) {
				callback.onError(e);
			}
		}
	}

	public void append(Context context, byte[] content, Callback callback) {
		executor.execute(() -> {
			try {
				writeSyncInternal(context, content, true);
				handler.post(() -> callback.onSuccess(null));
			} catch (Exception e) {
				handler.post(() -> callback.onError(e));
			}
		});
	}

	public void appendBufferSync(Context context, ByteBuffer content, @Nullable Callback callback) {
		try {
			writeBufferSyncInternal(context, content, true);
		} catch (Exception e) {
			if (callback != null) {
				callback.onError(e);
			}
		}
	}

	public void appendBuffer(Context context, ByteBuffer content, Callback callback) {
		executor.execute(() -> {
			try {
				writeBufferSyncInternal(context, content, true);
				handler.post(() -> callback.onSuccess(null));
			} catch (Exception e) {
				handler.post(() -> callback.onError(e));
			}
		});
	}

	public void appendTextSync(Context context, String content, @Nullable String encoding, @Nullable Callback callback) {
		try {
			writeTextSyncInternal(context, content, encoding, true);
		} catch (Exception e) {
			if (callback != null) {
				callback.onError(e);
			}
		}
	}

	public void appendText(Context context, String content, @Nullable String encoding, Callback callback) {
		executor.execute(() -> {
			try {
				writeTextSyncInternal(context, content, encoding, true);
				handler.post(() -> callback.onSuccess(null));
			} catch (Exception e) {
				handler.post(() -> callback.onError(e));
			}
		});
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

	private ByteBuffer readBufferSyncInternal(Context context) throws Exception {
		InputStream is = getInputStream(context, uri);

		ReadableByteChannel channel = Channels.newChannel(is);
		ByteBuffer buffer = ByteBuffer.allocateDirect(is.available());
		channel.read(buffer);

		return buffer;
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

	public @Nullable
	ByteBuffer readBufferSync(Context context, @Nullable Callback callback) {
		try {
			return readBufferSyncInternal(context);
		} catch (Exception e) {
			if (callback != null) {
				callback.onError(e);
			}
		}
		return null;
	}

	public void readBuffer(Context context, Callback callback) {
		executor.execute(() -> {
			try {
				ByteBuffer result = readBufferSyncInternal(context);
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
		int n = 0;
		char[] buf = new char[is.available()];
		InputStreamReader isr = new InputStreamReader(is, characterSet);
		StringWriter writer = new StringWriter();
    	while (-1 != (n = isr.read(buf))) writer.write(buf, 0, n);
    	return writer.toString();
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
		writeSyncInternal(context, content, false);
	}

	private void writeSyncInternal(Context context, byte[] content, boolean append) throws Exception {
		OutputStream os = getOutputStream(context, uri, append);
		os.write(content, 0, content.length);
		os.flush();
		os.close();
		try {
			updateInternal(context);
		} catch (Exception exception){
			Log.e(TAG, "Failed to updateValue: " + exception.getMessage());
		}
	}

	private void writeBufferSyncInternal(Context context, ByteBuffer content) throws Exception {
		writeBufferSyncInternal(context, content, false);
	}

	private void writeBufferSyncInternal(Context context, ByteBuffer content, boolean append) throws Exception {
		OutputStream os = getOutputStream(context, uri, append);
		WritableByteChannel channel = Channels.newChannel(os);
		channel.write(content);
		os.flush();
		os.close();
		try {
			updateInternal(context);
		} catch (Exception exception){
			Log.e(TAG, "Failed to updateValue: " + exception.getMessage());
		}
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

	public void writeBufferSync(Context context, ByteBuffer content, @Nullable Callback callback) {
		try {
			writeBufferSyncInternal(context, content);
		} catch (Exception e) {
			if (callback != null) {
				callback.onError(e);
			}
		}
	}

	public void writeBuffer(Context context, ByteBuffer content, Callback callback) {
		executor.execute(() -> {
			try {
				writeBufferSyncInternal(context, content);
				handler.post(() -> callback.onSuccess(null));
			} catch (Exception e) {
				handler.post(() -> callback.onError(e));
			}
		});
	}

	private void writeTextSyncInternal(Context context, String content, @Nullable String encoding) throws Exception {
		writeTextSyncInternal(context, content, encoding, false);
	}

	private void writeTextSyncInternal(Context context, String content, @Nullable String encoding, boolean append) throws Exception {
		OutputStream os = getOutputStream(context, uri, append);
		String characterSet = encoding;
		if (characterSet == null) {
			characterSet = "UTF-8";
		}
		OutputStreamWriter osw = new OutputStreamWriter(os, characterSet);
		osw.write(content);
		osw.flush();
		osw.close();
		try {
			updateInternal(context);
		} catch (Exception exception){
			Log.e(TAG, "Failed to updateValue: " + exception.getMessage());
		}
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
			if (Build.VERSION.SDK_INT >= 19 && DocumentsContract.isDocumentUri(context, uri)) {
				return DocumentsContract.deleteDocument(context.getContentResolver(), uri);
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
		try {
			if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
				context.getContentResolver().update(uri, values, null);
			} else {
				context.getContentResolver().update(uri, values, null, null);
			}
			updateInternal(context, false);
		} catch (Exception exception){
			Log.e(TAG, "Failed to updateValue: " + exception.getMessage());
		}
		
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

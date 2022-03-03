package org.nativescript.widgets;


import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.DocumentsContract;
import android.text.TextUtils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.net.URLConnection;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.util.List;

import androidx.annotation.RequiresApi;

public class File {
	private static final boolean UseDocumentContract = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O;
	private static boolean useDocumentContract(String path) {
		return UseDocumentContract && isTreeOrDocumentUri(Uri.parse(path));
	}


	@SuppressLint("NewApi")
	public static long fileLastModified(Context context, String path) {
		if (!useDocumentContract(path)) {
			java.io.File file = new java.io.File(path);
			if (!file.exists()) {
				return 0;
			}
			return file.lastModified();
		} else {
			String[] res = fileStats(context, path, new String[]{DocumentsContract.Document.COLUMN_LAST_MODIFIED});
			if (res != null) {
				return Long.parseLong(res[0]);
			}
			return 0;
		}
	}

	@SuppressLint("NewApi")
	public static long fileLength(Context context, String path) {
		if (!useDocumentContract(path)) {
			java.io.File file = new java.io.File(path);
			if (!file.exists()) {
				return 0;
			}
			return file.length();
		} else {
			String[] res = fileStats(context, path, new String[]{DocumentsContract.Document.COLUMN_SIZE});

			if (res != null) {
				return Long.parseLong(res[0]);
			}
			return 0;
		}
	}

	private static final String PATH_TREE = "tree";
	private static final String PATH_DOCUMENT = "document";

	public static boolean isTreeOrDocumentUri(Uri uri) {
		final List<String> paths = uri.getPathSegments();
		return ((PATH_TREE.equals(paths.get(0)) || PATH_DOCUMENT.equals(paths.get(0))));
	}

	public static boolean isTreeUri(Uri uri) {
		final List<String> paths = uri.getPathSegments();
		return (PATH_TREE.equals(paths.get(0)));
	}

	@RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
	public static String[] fileStats(Context context, String path, String[] fields) {
		Uri uri = Uri.parse(path);
		if (!useDocumentContract(path)) {
			java.io.File file = new java.io.File(path);
			String[] result = new String[fields.length];

			for (int i = 0; i < fields.length; i++) {
				switch (fields[i]) {
					case DocumentsContract.Document.COLUMN_MIME_TYPE:
						if (file.isDirectory()) {
							result[i] = android.provider.DocumentsContract.Document.MIME_TYPE_DIR;
						} else {
							result[i] = URLConnection.guessContentTypeFromName(file.getName());
						}
						break;
					case DocumentsContract.Document.COLUMN_SIZE:
						result[i] = file.length() + "";
						break;
					case DocumentsContract.Document.COLUMN_LAST_MODIFIED:
						result[i] = file.lastModified() + "";
						break;
				}
			}
			return result;
		}
		Uri treeDocumentUri = getTreeUri(context, uri);

		Cursor cursor = context.getContentResolver().query(treeDocumentUri, fields, null, null, null);
		if (cursor == null || cursor.getCount() == 0 || !cursor.moveToFirst()) {
			return null;
		}
		String[] result = new String[fields.length];

		for (int i = 0; i < fields.length; i++) {
			int cIndex = cursor.getColumnIndex(fields[i]);
			result[i] = cursor.getString(cIndex);
		}
		return result;
	}

	@RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
	private static Uri getTreeUri(Context context, Uri uri) {
		if (!isTreeUri(uri)) {
			return uri;
		}
		String documentId = DocumentsContract.getTreeDocumentId(uri);
		if (DocumentsContract.isDocumentUri(context, uri)) {
			documentId = DocumentsContract.getDocumentId(uri);
		}

		return DocumentsContract.buildDocumentUriUsingTree(uri, documentId);
	}

	@SuppressLint("NewApi")
	public static JSONArray getEntities(Context context, String path) {
		if (!folderExists(context, path)) {
			return null;
		}
		JSONArray array = new JSONArray();
		Uri uri = android.net.Uri.parse(path);
		try {
			if (!useDocumentContract(path)) {
				java.io.File file = new java.io.File(path);
				java.io.File[] filesList = file.listFiles();
				for (int i = 0; i < filesList.length; i++) {
					JSONObject object = new JSONObject();
					object.put("name", filesList[i].getName());
					object.put("path", filesList[i].getAbsolutePath());
					array.put(object);
				}
			} else {
				Uri treeDocumentUri = getTreeUri(context, uri);
				Uri childrenUri = android.provider.DocumentsContract.buildChildDocumentsUriUsingTree(treeDocumentUri, android.provider.DocumentsContract.getTreeDocumentId(treeDocumentUri));
				Cursor cursor = context.getContentResolver().query(childrenUri, new String[]{android.provider.DocumentsContract.Document.COLUMN_DOCUMENT_ID, android.provider.OpenableColumns.DISPLAY_NAME}, null, null, null);

				int nameIndex = cursor.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME);
				int idIndex = cursor.getColumnIndex(android.provider.DocumentsContract.Document.COLUMN_DOCUMENT_ID);
				if (cursor != null) {
					while (cursor.moveToNext()) {
						final Uri documentUri = DocumentsContract.buildDocumentUriUsingTree(treeDocumentUri,
							cursor.getString(idIndex));
						JSONObject object = new JSONObject();
						object.put("name", cursor.getString(nameIndex));
						object.put("path", getTreeUri(context, documentUri).toString());
						array.put(object);

					}
				}

			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return array;
	}

	public static JSONObject fileParent(Context context, String path) {
		if (!useDocumentContract(path)) {
			java.io.File javaFile = new java.io.File(path);
			java.io.File parent = javaFile.getParentFile();
			JSONObject object = new JSONObject();
			try {
				object.put("name", parent.getName());
				object.put("path", parent.getAbsolutePath());
			} catch (JSONException e) {
				e.printStackTrace();
				return null;
			}
			return object;
		} else {
			// TODO: is that even possible? how to build parent Uri
			return null;
		}
	}

	@SuppressLint("NewApi")
	public static boolean fileExists(Context context, String path) {
		if (!useDocumentContract(path)) {
			java.io.File file = new java.io.File(path);
			return file.exists();
		} else {
			String[] res = fileStats(context, path, new String[]{DocumentsContract.Document.COLUMN_MIME_TYPE});
			return res != null;
		}
	}

	public static boolean ensureFileExists(Context context, String path, boolean isFolder) throws IOException {
		boolean created = false;
		if (!useDocumentContract(path)) {
			java.io.File file = new java.io.File(path);
			if (!file.exists()) {
				if (isFolder) {
					created = file.mkdirs();
				} else {
					file.getParentFile().mkdirs();
					created = file.createNewFile();
				}
				if (created) {
					file.setReadable(true);
					file.setWritable(true);
				}
			}
		}
		return created;
	}


	@SuppressLint("NewApi")
	public static boolean folderExists(Context context, String path) {
		if (!useDocumentContract(path)) {
			java.io.File file = new java.io.File(path);
			return file.exists() && file.isDirectory();
		} else {
			String[] res = fileStats(context, path, new String[]{DocumentsContract.Document.COLUMN_MIME_TYPE});
			return res != null && android.provider.DocumentsContract.Document.MIME_TYPE_DIR.equals(res[0]);
		}
	}


	public static void writeText(Context context, String path, String content, String charset) throws Exception {
		java.io.FileOutputStream stream = Utils.getFileOutputStream(context, path);
		java.io.OutputStreamWriter writer = new java.io.OutputStreamWriter(stream, Charset.forName(charset));
		writer.write(content);
		writer.close();
	}

	public static void writeBytes(Context context, String path, byte[] bytes) throws Exception {
		java.io.FileOutputStream stream = Utils.getFileOutputStream(context, path);
		stream.write(bytes, 0, bytes.length);
		stream.close();
	}

	@SuppressLint("NewApi")
	public static boolean canRead(Context context, String path) {
		if (!useDocumentContract(path)) {
			java.io.File file = new java.io.File(path);
			return file.canRead();
		}
		Uri uri = Uri.parse(path);
		// Ignore if grant doesn't allow read
		if (context.checkCallingOrSelfUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION)
			!= PackageManager.PERMISSION_GRANTED) {
			return false;
		}
		final String[] stats = fileStats(context, path, new String[]{DocumentsContract.Document.COLUMN_MIME_TYPE, DocumentsContract.Document.COLUMN_FLAGS,});
		final String type = stats[0];
		// Ignore documents without MIME
		if (TextUtils.isEmpty(type)) {
			return false;
		}

		return true;
	}

	@SuppressLint("NewApi")
	public static boolean canWrite(Context context, String path) {
		if (!useDocumentContract(path)) {
			java.io.File file = new java.io.File(path);
			return file.canWrite();
		}
		Uri uri = Uri.parse(path);
		// Ignore if grant doesn't allow write
		if (context.checkCallingOrSelfUriPermission(uri, Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
			!= PackageManager.PERMISSION_GRANTED) {
			return false;
		}

		final String[] stats = fileStats(context, path, new String[]{DocumentsContract.Document.COLUMN_MIME_TYPE, DocumentsContract.Document.COLUMN_FLAGS,});
		final String type = stats[0];
		final int flags = Integer.parseInt(stats[1]);

		// Ignore documents without MIME
		if (TextUtils.isEmpty(type)) {
			return false;
		}

		// Deletable documents considered writable
		if ((flags & DocumentsContract.Document.FLAG_SUPPORTS_DELETE) != 0) {
			return true;
		}

		if (DocumentsContract.Document.MIME_TYPE_DIR.equals(type)
			&& (flags & DocumentsContract.Document.FLAG_DIR_SUPPORTS_CREATE) != 0) {
			// Directories that allow create considered writable
			return true;
		} else if (!TextUtils.isEmpty(type)
			&& (flags & DocumentsContract.Document.FLAG_SUPPORTS_WRITE) != 0) {
			// Writable normal files considered writable
			return true;
		}

		return false;
	}

}

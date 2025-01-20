package org.nativescript.winter_tc;

import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.ParcelFileDescriptor;
import android.util.Base64;
import android.util.Base64OutputStream;
import android.util.Log;
import android.util.Pair;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.FileDescriptor;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.nio.ByteBuffer;

public class Utils {

	public static void copyToBuffer(ByteBuffer buffer, byte[] data) {
		copyToBuffer(buffer, data, 0, data.length, false);
	}

	public static void copyToBuffer(ByteBuffer buffer, byte[] data, int offset) {
		copyToBuffer(buffer, data, offset, data.length);
	}

	public static void copyToBuffer(ByteBuffer buffer, byte[] data, int offset, int length) {
		copyToBuffer(buffer, data, offset, length, false);
	}

	public static void copyToBuffer(ByteBuffer buffer, byte[] data, int offset, int length, boolean rewind) {
		if (rewind) {
			buffer.rewind();
		}
		buffer.put(data, offset, length);
	}

	public static String atob(String encodedData) {
		byte[] decoded = android.util.Base64.decode(encodedData, Base64.NO_WRAP);
		try {
			return new String(decoded, "UTF-8");
		} catch (UnsupportedEncodingException e) {
			return "";
		}
	}

	public static String btoa(String data) {
		try {
			byte[] bytes = data.getBytes("UTF-8");
			return android.util.Base64.encodeToString(bytes, android.util.Base64.NO_WRAP);
		} catch (UnsupportedEncodingException e) {
			return "";
		}
	}
}

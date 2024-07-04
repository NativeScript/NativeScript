package org.nativescript.widgets;

import java.nio.ByteBuffer;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.UUID;

public class Crypto {
	public static String randomUUID() {
		return UUID.randomUUID().toString().toLowerCase();
	}

	public static void getRandomValues(ByteBuffer buffer) {
		SecureRandom random = new SecureRandom();
		if (!buffer.isDirect()) {
			random.nextBytes(buffer.array());
		} else {
			buffer.rewind();
			int size = buffer.capacity();
			byte[] tempBuf = new byte[size];
			random.nextBytes(tempBuf);
			buffer.put(tempBuf);
		}
	}

	public static ByteBuffer digest(int mode, ByteBuffer data) {
		MessageDigest instance = null;
		switch (mode) {
			case 0: {
				try {
					instance = MessageDigest.getInstance("SHA-1");
					instance.update(data);
				} catch (NoSuchAlgorithmException ignored) {}
				break;
			}
			case 1: {
				try {
					instance = MessageDigest.getInstance("SHA-256");
					instance.update(data);
				} catch (NoSuchAlgorithmException ignored) {}
				break;
			}
			case 2: {
				try {
					instance = MessageDigest.getInstance("SHA-384");
					instance.update(data);
				} catch (NoSuchAlgorithmException ignored) {}
				break;
			}
			case 4: {
				try {
					instance = MessageDigest.getInstance("SHA-512");
					instance.update(data);
				} catch (NoSuchAlgorithmException ignored) {}
				break;
			}
			default:
				return null;
		}


		if (instance != null) {
			byte[] digest = instance.digest();
			ByteBuffer ret = ByteBuffer.allocateDirect(digest.length);
			ret.put(digest);
			ret.rewind();
			return ret;
		}
		return null;
	}
}

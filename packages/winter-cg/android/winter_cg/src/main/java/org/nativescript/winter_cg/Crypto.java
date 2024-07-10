package org.nativescript.winter_cg;

import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.RSAKeyGenParameterSpec;
import java.util.Arrays;
import java.util.UUID;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.KeyGenerator;
import javax.crypto.Mac;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKey;
import javax.crypto.Cipher;

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
				} catch (NoSuchAlgorithmException ignored) {
				}
				break;
			}
			case 1: {
				try {
					instance = MessageDigest.getInstance("SHA-256");
					instance.update(data);
				} catch (NoSuchAlgorithmException ignored) {
				}
				break;
			}
			case 2: {
				try {
					instance = MessageDigest.getInstance("SHA-384");
					instance.update(data);
				} catch (NoSuchAlgorithmException ignored) {
				}
				break;
			}
			case 4: {
				try {
					instance = MessageDigest.getInstance("SHA-512");
					instance.update(data);
				} catch (NoSuchAlgorithmException ignored) {
				}
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

	public static SecretKey generateKeyHMAC(String algo) {
		try {
			KeyGenerator mac = KeyGenerator.getInstance(algo);
			return mac.generateKey();
		} catch (NoSuchAlgorithmException e) {
			return null;
		}
	}

	public static ByteBuffer signHMAC(String algo, SecretKey key, ByteBuffer data) {
		try {
			data.rewind();
			Mac mac = Mac.getInstance(algo);
			mac.init(key);
			mac.update(data);
			byte[] signed = mac.doFinal();
			ByteBuffer ret = ByteBuffer.allocateDirect(signed.length);
			ret.put(signed);
			ret.rewind();
			return ret;
		} catch (NoSuchAlgorithmException e) {
			return null;
		} catch (InvalidKeyException e) {
			return null;
		}
	}

	public static boolean verifyHMAC(String algo, SecretKey key, ByteBuffer signature, ByteBuffer data) {
		try {
			signature.rewind();
			data.rewind();
			Mac mac = Mac.getInstance(algo);
			mac.init(key);
			mac.update(data);
			byte[] signed = mac.doFinal();
			byte[] buf = new byte[signature.remaining()];
			signature.get(buf);
			signature.rewind();
			return Arrays.equals(signed, buf);
		} catch (NoSuchAlgorithmException e) {
			return false;
		} catch (InvalidKeyException e) {
			return false;
		}
	}

	public static KeyPair generateKeyRsaOAEP(int modulusLength) {
		try {
			KeyPairGenerator keyPairGen = KeyPairGenerator.getInstance("RSA");
			RSAKeyGenParameterSpec spec = new RSAKeyGenParameterSpec(modulusLength, RSAKeyGenParameterSpec.F4);
			keyPairGen.initialize(spec);
			return keyPairGen.generateKeyPair();
		} catch (NoSuchAlgorithmException e) {
			return null;
		} catch (InvalidAlgorithmParameterException e) {
			return null;
		}
	}


	public static ByteBuffer encryptRsaOAEP(KeyPair pair, int mode, ByteBuffer data){
		String transformation = null;
		switch (mode){
			case 0:
				transformation = "RSA/ECB/OAEPWithSHA-1AndMGF1Padding";
				break;
			case 1:
				transformation = "RSA/ECB/OAEPWithSHA-256AndMGF1Padding";
				break;
			case 2:
				transformation = "RSA/ECB/OAEPWithSHA-384AndMGF1Padding";
				break;
			case 3:
				transformation = "RSA/ECB/OAEPWithSHA-512AndMGF1Padding";
				break;
		}
		if(transformation == null){
			return null;
		}

		try {
			Cipher cipher = Cipher.getInstance(transformation);
			cipher.init(Cipher.ENCRYPT_MODE, pair.getPublic());
			data.rewind();
			byte[] byteArray = new byte[data.remaining()];
			data.get(byteArray);

			byte[] buf = cipher.doFinal(byteArray);
			ByteBuffer ret = ByteBuffer.allocateDirect(buf.length);

			ret.put(buf);
			ret.rewind();
			return ret;
		} catch (NoSuchAlgorithmException e) {
			return null;
		} catch (NoSuchPaddingException e) {
			return null;
		} catch (IllegalBlockSizeException e) {
			return null;
		} catch (BadPaddingException e) {
			return null;
		} catch (InvalidKeyException e) {
			return null;
		}
	}

	public static ByteBuffer decryptRsaOAEP(KeyPair pair, int mode, ByteBuffer data){
		String transformation = null;

		switch (mode){
			case 0:
				transformation = "RSA/ECB/OAEPWithSHA-1AndMGF1Padding";
				break;
			case 1:
				transformation = "RSA/ECB/OAEPWithSHA-256AndMGF1Padding";
				break;
			case 2:
				transformation = "RSA/ECB/OAEPWithSHA-384AndMGF1Padding";
				break;
			case 3:
				transformation = "RSA/ECB/OAEPWithSHA-512AndMGF1Padding";
				break;
		}
		if(transformation == null){
			return null;
		}

		try {
			Cipher cipher = Cipher.getInstance(transformation);
			cipher.init(Cipher.DECRYPT_MODE, pair.getPrivate());
			data.rewind();
			byte[] byteArray = new byte[data.remaining()];
			data.get(byteArray);

			byte[] buf = cipher.doFinal(byteArray);
			ByteBuffer ret = ByteBuffer.allocateDirect(buf.length);
			ret.put(buf);
			ret.rewind();
			return ret;
		} catch (NoSuchAlgorithmException e) {
			return null;
		} catch (NoSuchPaddingException e) {
			return null;
		} catch (IllegalBlockSizeException e) {
			return null;
		} catch (BadPaddingException e) {
			return null;
		} catch (InvalidKeyException e) {
			return null;
		}
	}
}


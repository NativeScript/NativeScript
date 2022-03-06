package org.nativescript.widgets.filesystem;

import android.os.ParcelFileDescriptor;

import org.json.JSONObject;

import java.io.IOException;
import java.nio.ByteBuffer;

public class FileHandle {
	public boolean closed;
	int fd;
	long nativeFileHandle;

	static native long nativeInit(int fd);

	static native FileHandle nativeOpen(String path, int flags, int mode, long callback);

	static native long nativeDispose(long fd);

	static native void nativeClose(long fh);

	static native void nativeAppend(long fo, long fi);

	static native void nativeAppendString(long fh, String data);

	static native void nativeAppendBytes(long fh, byte[] data);

	static native void nativeAppendBuffer(long fh, ByteBuffer data);

	static native long nativeRead(long fh, byte[] buffer, long offset, long length, long position);

	static native long nativeReadBuffer(long fh, ByteBuffer buffer, long offset, long length, long position);

	static native long nativeWrite(long fh, long data);

	static native void nativeWriteString(long fh, String data);

	static native long nativeWriteBytes(long fh, byte[] data);

	static native long nativeWriteBuffer(long fh, ByteBuffer buffer);

	static native JSONObject nativeStat(long fh);

	static native void nativeDataSync(long fh);

	static native void nativeSync(long fh);

	static native void nativeFutimes(long fh, long atime, long mtime);

	static native void nativeCopyFile(String src, String dest);

	static native void nativeUnlink(String path);

	FileHandle(ParcelFileDescriptor pfd) {
		// Gets around the warning
		/*
		 * Peer expected signal when closed unable to deliver after detach
		 *  */
		try {
			ParcelFileDescriptor descriptor = pfd.dup();
			fd = descriptor.detachFd();
			nativeFileHandle = nativeInit(
				fd
			);
			// close orig
			pfd.close();
		} catch (IOException ignored) {
		}
	}

	FileHandle(int fd){
		nativeFileHandle = nativeInit(fd);
	}

	int getFd() {
		return fd;
	}

	public static void open(String path, int flag, int mode, AsyncCallback<FileHandle> callback) {
		nativeOpen(path, flag, mode, callback.nativeCallback);
	}

	/*

	public void close(FileSystem.Callback<Void> callback) {
		executor.execute(() -> {
			try {
				closeSync(this);
				callback.onSuccess(null);
			} catch (IOException e) {
				callback.onError(e);
			}
		});
	}

	public void appendFile(FileHandle data, String options, FileSystem.Callback<Void> callback) {
		executors.execute(() -> {
			boolean error = false;
			try {
				appendFileSync(this, data, options);
			} catch (IOException e) {
				callback.onError(e);
				error = true;
			} finally {
				if (!error) {
					callback.onSuccess(null);
				}
			}
		});
	}

	public void appendFile(String data, String options, FileSystem.Callback<Void> callback) {
		executors.execute(() -> {
			boolean error = false;
			try {
				appendFileSync(this, data, options);
			} catch (IOException e) {
				callback.onError(e);
				error = true;
			} finally {
				if (!error) {
					callback.onSuccess(null);
				}
			}
		});
	}

	public void appendFile(ByteBuffer data, String options, FileSystem.Callback<Void> callback) {
		executors.execute(() -> {
			try {
				appendFileSync(this, data, options);
				callback.onSuccess(null);
			} catch (IOException e) {
				callback.onError(e);
			}
		});
	}

	public void appendFile(byte[] data, String options, FileSystem.Callback<Void> callback) {
		executors.execute(() -> {
			try {
				appendFileSync(this, data, options);
				callback.onSuccess(null);
			} catch (IOException e) {
				callback.onError(e);
			}
		});
	}

	public void read(byte[] buffer, int offset, int length, int position, FileSystem.Callback<Long> callback) {
		executors.execute(() -> {
			try {
				long read = readSync(this, buffer, offset, length, position);
				callback.onSuccess(read);
			} catch (IOException e) {
				callback.onError(e);
			}
		});
	}

	public void read(ByteBuffer buffer, int offset, int length, int position, FileSystem.Callback<Long> callback) {
		executors.execute(() -> {
			try {
				long read = readSync(this, buffer, offset, length, position);
				callback.onSuccess(read);
			} catch (IOException e) {
				callback.onError(e);
			}
		});
	}

	public void stat(FileSystem.Callback<String> callback) {
		executor.execute(() -> {
			try {
				JSONObject json = statSync(this);
				callback.onSuccess(json.toString());
			} catch (IOException e) {
				callback.onError(e);
			}
		});
	}

	public void datasync(FileSystem.Callback<Void> callback) {
		executor.execute(() -> {
			try {
				fdatasyncSync(this);
				callback.onSuccess(null);
			} catch (Exception e) {
				callback.onError(e);
			}
		});
	}

	public void sync(FileSystem.Callback<Void> callback) {
		executor.execute(() -> {
			try {
				fsyncSync(this);
				callback.onSuccess(null);
			} catch (Exception e) {
				callback.onError(e);
			}
		});
	}

	public void futimes(long atime, long mtime, FileSystem.Callback<Void> callback) {
		executor.execute(() -> {
			try {
				futimesSync(this, atime, mtime);
				callback.onSuccess(null);
			} catch (Exception e) {
				callback.onError(e);
			}
		});
	}

	public void copyFile(String src, String dest, FileSystem.Callback<Void> callback) {
		executors.execute(() -> {
			try {
				copyFileSync(src, dest);
				callback.onSuccess(null);
			} catch (Exception e) {
				callback.onError(e);
			}
		});
	}

	public void write(FileHandle data, String options, FileSystem.Callback<Void> callback) {
		executors.execute(() -> {
			boolean error = false;
			try {
				writeSync(this, data, options);
			} catch (IOException e) {
				callback.onError(e);
				error = true;
			} finally {
				if (!error) {
					callback.onSuccess(null);
				}
			}
		});
	}

	public void write(String data, String options, FileSystem.Callback<Void> callback) {
		executors.execute(() -> {
			boolean error = false;
			try {
				writeSync(this, data, options);
			} catch (IOException e) {
				callback.onError(e);
				error = true;
			} finally {
				if (!error) {
					callback.onSuccess(null);
				}
			}
		});
	}

	public void write(ByteBuffer data, String options, FileSystem.Callback<Void> callback) {
		executors.execute(() -> {
			try {
				writeSync(this, data, options);
				callback.onSuccess(null);
			} catch (IOException e) {
				callback.onError(e);
			}
		});
	}

	public void write(byte[] data, String options, FileSystem.Callback<Void> callback) {
		executors.execute(() -> {
			try {
				writeSync(this, data, options);
				callback.onSuccess(null);
			} catch (IOException e) {
				callback.onError(e);
			}
		});
	}

	@Override
	protected void finalize() throws Throwable {
		try {
			closeSync(this);
			nativeDispose(nativeFileHandle);
		} catch (Exception ignored) {
		}
	}
	*/
}

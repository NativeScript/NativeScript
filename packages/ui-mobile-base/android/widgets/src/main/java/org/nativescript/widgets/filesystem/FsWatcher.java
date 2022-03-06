package org.nativescript.widgets.filesystem;

public class FsWatcher {
	long callback;
	String fileName;

	private static native void nativeClose(String fileName, long nativeEvent);

	private static native void nativeRef(String fileName, long nativeEvent);

	private static native void nativeUnref(String fileName, long nativeEvent);

	public static class Event {
		String fileName;
		String eventType;

		Event() {
		}

		public String getEventType() {
			return eventType;
		}

		public String getFileName() {
			return fileName;
		}
	}

	FsWatcher() {
	}

	public void ref() {
		nativeRef(fileName, callback);
	}

	public void unref() {
		nativeUnref(fileName, callback);
	}

	public void close() {
		nativeClose(fileName, callback);
	}


	@Override
	protected void finalize() throws Throwable {
		// remove listener on cleanup
		nativeUnref(fileName, callback);
	}
}

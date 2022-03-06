package org.nativescript.widgets.filesystem;

public class FileWatcher {
	long callback;
	String fileName;

	private static native void nativeRef(String fileName, long nativeEvent);

	private static native void nativeUnref(String fileName, long nativeEvent);

	public static class Event {
		FileStat previous;
		FileStat current;

		Event() {
		}

		public FileStat getCurrent() {
			return current;
		}

		public FileStat getPrevious() {
			return previous;
		}
	}

	FileWatcher() {
	}

	public void ref() {
		nativeRef(fileName, callback);
	}

	public void unref() {
		nativeUnref(fileName, callback);
	}


	@Override
	protected void finalize() throws Throwable {
		// remove listener on cleanup
		nativeUnref(fileName, callback);
	}
}

package org.nativescript.widgets.filesystem;

public abstract class AsyncCallback<T> {
	final long nativeCallback;

	private native long createAsyncCallback(AsyncCallback<T> callback);

	private native void disposeAsyncCallback(long callback);

	static {
		FileSystem.loadNative();
	}

	public AsyncCallback() {
		nativeCallback = createAsyncCallback(this);
	}

	public abstract void onSuccess(T result);

	public abstract void onError(Object error);

	@Override
	protected void finalize() throws Throwable {
		disposeAsyncCallback(nativeCallback);
	}
}

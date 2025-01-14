package org.nativescript.widgets;

import android.content.ContentValues;
import android.content.Context;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.BitmapDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Looper;
import android.util.Base64;
import android.util.Log;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.Closeable;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.net.CookieHandler;
import java.net.CookieManager;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.channels.FileChannel;
import java.nio.channels.ReadableByteChannel;
import java.nio.channels.WritableByteChannel;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Stack;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.zip.GZIPInputStream;

public class Async {
	static final String TAG = "Async";
	static ThreadPoolExecutor executor = null;

	static ThreadPoolExecutor threadPoolExecutor() {
		if (executor == null) {
			int NUMBER_OF_CORES = Runtime.getRuntime().availableProcessors();
			ThreadFactory backgroundPriorityThreadFactory = new PriorityThreadFactory(android.os.Process.THREAD_PRIORITY_BACKGROUND);

			executor = new ThreadPoolExecutor(
				NUMBER_OF_CORES * 2,
				NUMBER_OF_CORES * 2,
				60L,
				TimeUnit.SECONDS,
				new LinkedBlockingQueue<Runnable>(),
				backgroundPriorityThreadFactory
			);
		}

		return executor;
	}

	public interface CompleteCallback {
		void onComplete(Object result, Object tag);

		void onError(String error, Object tag);
	}

	static class PriorityThreadFactory implements ThreadFactory {
		private final int mThreadPriority;

		public PriorityThreadFactory(int threadPriority) {
			mThreadPriority = threadPriority;
		}

		@Override
		public Thread newThread(final Runnable runnable) {
			Runnable wrapperRunnable = new Runnable() {
				@Override
				public void run() {
					try {
						android.os.Process.setThreadPriority(mThreadPriority);
					} catch (Throwable t) {

					}
					runnable.run();
				}
			};
			return new Thread(wrapperRunnable);
		}
	}

	public static class Image {
		/*
		 * The request id parameter is needed for the sake of the JavaScript implementation.
		 * Because we want to use only one extend of the CompleteCallback interface (for the sake of better performance)
		 * we use this id to detect the initial request, which result is currently received in the complete callback.
		 * When the async task completes it will pass back this id to JavaScript.
		 */
		public static void fromResource(final String name, final Context context, final int requestId, final CompleteCallback callback) {
			final android.os.Handler mHandler = new android.os.Handler(Looper.myLooper());
			threadPoolExecutor().execute(new Runnable() {
				@Override
				public void run() {
					final LoadImageFromResourceTask task = new LoadImageFromResourceTask(context, requestId, callback);
					final Bitmap result = task.doInBackground(name);
					mHandler.post(new Runnable() {
						@Override
						public void run() {
							task.onPostExecute(result);
						}
					});
				}
			});
		}

		public static void fromFile(final String fileName, final int requestId, final CompleteCallback callback) {
			final android.os.Handler mHandler = new android.os.Handler(Looper.myLooper());
			threadPoolExecutor().execute(new Runnable() {
				@Override
				public void run() {
					final LoadImageFromFileTask task = new LoadImageFromFileTask(requestId, callback);
					final Bitmap result = task.doInBackground(fileName);
					mHandler.post(new Runnable() {
						@Override
						public void run() {
							task.onPostExecute(result);
						}
					});
				}
			});
		}

		public static void fromBase64(final String source, final int requestId, final CompleteCallback callback) {
			final android.os.Handler mHandler = new android.os.Handler(Looper.myLooper());
			threadPoolExecutor().execute(new Runnable() {
				@Override
				public void run() {
					final LoadImageFromBase64StringTask task = new LoadImageFromBase64StringTask(requestId, callback);
					final Bitmap result = task.doInBackground(source);
					mHandler.post(new Runnable() {
						@Override
						public void run() {
							task.onPostExecute(result);
						}
					});
				}
			});
		}

		public static void download(final String url, final CompleteCallback callback, final Object context) {
			final android.os.Handler mHandler = new android.os.Handler(Looper.myLooper());
			threadPoolExecutor().execute(new Runnable() {
				@Override
				public void run() {
					final DownloadImageTask task = new DownloadImageTask(callback, context);
					final Bitmap result = task.doInBackground(url);
					mHandler.post(new Runnable() {
						@Override
						public void run() {
							task.onPostExecute(result);
						}
					});
				}
			});
		}

		static class DownloadImageTask {
			private final CompleteCallback callback;
			private final Object context;

			public DownloadImageTask(CompleteCallback callback, Object context) {
				this.callback = callback;
				this.context = context;
			}

			protected Bitmap doInBackground(String... params) {
				InputStream stream = null;
				try {
					stream = new java.net.URL(params[0]).openStream();
					Bitmap bmp = BitmapFactory.decodeStream(stream);
					return bmp;
				} catch (Throwable t) {
					Log.e(TAG, "Failed to decode stream, Throwable: " + t.getMessage());
					return null;
				} finally {
					if (stream != null) {
						try {
							stream.close();
						} catch (IOException e) {
							Log.e(TAG, "Failed to close stream, IOException: " + e.getMessage());
						}
					}
				}
			}

			protected void onPostExecute(final Bitmap result) {
				if (result != null) {
					this.callback.onComplete(result, this.context);
				} else {
					this.callback.onError("DownloadImageTask returns no result.", this.context);
				}
			}
		}

		static class LoadImageFromResourceTask {
			private final CompleteCallback callback;
			private final Context context;
			private final int requestId;

			public LoadImageFromResourceTask(Context context, int requestId, CompleteCallback callback) {
				this.callback = callback;
				this.context = context;
				this.requestId = requestId;
			}

			protected Bitmap doInBackground(String... params) {
				String name = params[0];
				Resources res = this.context.getResources();
				int id = res.getIdentifier(name, "drawable", context.getPackageName());

				if (id > 0) {
					BitmapDrawable result = (BitmapDrawable) res.getDrawable(id);
					return result.getBitmap();
				}

				return null;
			}

			protected void onPostExecute(final Bitmap result) {
				if (result != null) {
					this.callback.onComplete(result, this.requestId);
				} else {
					this.callback.onError("LoadImageFromResourceTask returns no result.", this.requestId);
				}
			}
		}

		static class LoadImageFromFileTask {
			private final CompleteCallback callback;
			private final int requestId;

			public LoadImageFromFileTask(int requestId, CompleteCallback callback) {
				this.callback = callback;
				this.requestId = requestId;
			}

			protected Bitmap doInBackground(String... params) {
				String fileName = params[0];
				return BitmapFactory.decodeFile(fileName);
			}

			protected void onPostExecute(final Bitmap result) {
				if (result != null) {
					this.callback.onComplete(result, this.requestId);
				} else {
					this.callback.onError("LoadImageFromFileTask returns no result.", this.requestId);
				}
			}
		}

		static class LoadImageFromBase64StringTask {
			private final CompleteCallback callback;
			private final int requestId;

			public LoadImageFromBase64StringTask(int requestId, CompleteCallback callback) {
				this.callback = callback;
				this.requestId = requestId;
			}

			protected Bitmap doInBackground(String... params) {
				String source = params[0];
				byte[] bytes = Base64.decode(source, Base64.DEFAULT);
				return BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
			}

			protected void onPostExecute(final Bitmap result) {
				if (result != null) {
					this.callback.onComplete(result, this.requestId);
				} else {
					this.callback.onError("LoadImageFromBase64StringTask returns no result.", this.requestId);
				}
			}
		}
	}

	public static class Http {
		private static final String GET_METHOD = "GET";
		private static final String HEAD_METHOD = "HEAD";
		private static CookieManager cookieManager;

		public static void setCookieManager(CookieManager manager) {
			if(manager == null) return;

			cookieManager = manager;
			if (CookieHandler.getDefault() == null) {
				CookieHandler.setDefault(manager);
			}
    }
		
		public static CookieManager initializeCookieManager() {
			if (cookieManager == null) {
				CookieHandler defaultHandler = CookieHandler.getDefault();
				if (defaultHandler instanceof CookieManager) {
					cookieManager = (CookieManager) defaultHandler;
				} else {
					cookieManager = new CookieManager();
					CookieHandler.setDefault(cookieManager);
				}
			}

			return cookieManager;
    }

		public static void MakeRequest(final RequestOptions options, final CompleteCallback callback, final Object context) {
			if (cookieManager == null) {
				initializeCookieManager();
			}

			final android.os.Handler mHandler = new android.os.Handler(Looper.myLooper());
			threadPoolExecutor().execute(new Runnable() {
				@Override
				public void run() {
					final HttpRequestTask task = new HttpRequestTask(callback, context);
					final RequestResult result = task.doInBackground(options);
					mHandler.post(new Runnable() {
						@Override
						public void run() {
							task.onPostExecute(result);
						}
					});
				}
			});
		}

		public static class KeyValuePair {
			public String key;
			public String value;

			public KeyValuePair(String key, String value) {
				this.key = key;
				this.value = value;
			}
		}

		public static class RequestOptions {
			public String url;
			public String method;
			public ArrayList<KeyValuePair> headers;
			public Object content;
			public int timeout = -1;
			public int screenWidth = -1;
			public int screenHeight = -1;
			public boolean dontFollowRedirects = false;

			public void addHeaders(HttpURLConnection connection) {
				if (this.headers == null) {
					return;
				}
				boolean hasAcceptHeader = false;

				for (KeyValuePair pair : this.headers) {
					String key = pair.key;
					connection.addRequestProperty(key, pair.value);
					if (key.toLowerCase().contentEquals("accept-encoding")) {
						hasAcceptHeader = true;
					}
				}

				// If the user hasn't added an Accept-Encoding header, we add gzip as something we accept
				if (!hasAcceptHeader) {
					connection.addRequestProperty("Accept-Encoding", "gzip");
				}
			}

			public void writeContent(HttpURLConnection connection, Stack<Closeable> openedStreams) throws IOException {
				if (this.content == null) {
					return;
				}

				OutputStream outStream = connection.getOutputStream();
				openedStreams.push(outStream);

				if (this.content instanceof String) {
					OutputStreamWriter writer = new OutputStreamWriter(outStream);
					openedStreams.push(writer);

					writer.write((String) this.content);
				} else {
					outStream.write(((java.nio.ByteBuffer) this.content).array());
				}
			}
		}

		public static class RequestResult {
			public ByteArrayOutputStream raw;
			public ArrayList<KeyValuePair> headers = new ArrayList<KeyValuePair>();
			public int statusCode;
			public String responseAsString;
			public Bitmap responseAsImage;
			public Exception error;
			public String url;
			public String statusText;

			public void getHeaders(HttpURLConnection connection) {
				Map<String, List<String>> headers = connection.getHeaderFields();
				if (headers == null) {
					// no headers, this may happen if there is no internet connection currently available
					return;
				}

				int size = headers.size();
				if (size == 0) {
					return;
				}

				for (Map.Entry<String, List<String>> entry : headers.entrySet()) {
					String key = entry.getKey();
					for (String value : entry.getValue()) {
						this.headers.add(new KeyValuePair(key, value));
					}
				}
			}

			public void readResponseStream(HttpURLConnection connection, Stack<Closeable> openedStreams, RequestOptions options) throws IOException {
				int contentLength = connection.getContentLength();

				InputStream inStream =
					this.statusCode >= 400
						? connection.getErrorStream()
						: connection.getInputStream();

				if (inStream == null) {
					// inStream is null when receiving status code 401 or 407
					// see this thread for more information http://stackoverflow.com/a/24986433
					return;
				}

				// In the event we don't have a null stream, and we have gzip as part of the encoding
				// then we will use gzip to decode the stream
				// Ignore gzip encoding for 204 'No Content' status to prevent java.io.EOFException
				String encodingHeader = connection.getHeaderField("Content-Encoding");
				if (encodingHeader != null && encodingHeader.toLowerCase().contains("gzip") && this.statusCode != 204) {
					inStream = new GZIPInputStream(inStream);
				}

				openedStreams.push(inStream);

				BufferedInputStream buffer = new BufferedInputStream(inStream, 4096);
				openedStreams.push(buffer);

				ByteArrayOutputStream2 responseStream = contentLength != -1 ? new ByteArrayOutputStream2(contentLength) : new ByteArrayOutputStream2();
				openedStreams.push(responseStream);

				byte[] buff = new byte[4096];
				int read = -1;
				while ((read = buffer.read(buff, 0, buff.length)) != -1) {
					responseStream.write(buff, 0, read);
				}

				this.raw = responseStream;
				buff = null;

				// make the byte array conversion here, not in the JavaScript
				// world for better performance
				// since we do not have some explicit way to determine whether
				// the content-type is image
				try {
					// TODO: Generally this approach will not work for very
					// large files
					BitmapFactory.Options bitmapOptions = new BitmapFactory.Options();
					bitmapOptions.inJustDecodeBounds = true;

					// check the size of the bitmap first
					BitmapFactory.decodeByteArray(responseStream.buf(), 0, responseStream.size(), bitmapOptions);
					if (bitmapOptions.outWidth > 0 && bitmapOptions.outHeight > 0) {
						int scale = 1;
						final int height = bitmapOptions.outHeight;
						final int width = bitmapOptions.outWidth;

						if ((options.screenWidth > 0 && bitmapOptions.outWidth > options.screenWidth) ||
							(options.screenHeight > 0 && bitmapOptions.outHeight > options.screenHeight)) {
							final int halfHeight = height / 2;
							final int halfWidth = width / 2;

							// scale down the image since it is larger than the
							// screen resolution
							while ((halfWidth / scale) > options.screenWidth && (halfHeight / scale) > options.screenHeight) {
								scale *= 2;
							}
						}

						bitmapOptions.inJustDecodeBounds = false;
						bitmapOptions.inSampleSize = scale;
						this.responseAsImage = BitmapFactory.decodeByteArray(responseStream.buf(), 0, responseStream.size(), bitmapOptions);
					}
				} catch (Throwable t) {
					Log.e(TAG, "Failed to decode byte array, Throwable: " + t.getMessage());
				}

				if (this.responseAsImage == null) {
					// convert to string
					this.responseAsString = responseStream.toString();
				}
			}

			public static final class ByteArrayOutputStream2 extends ByteArrayOutputStream {
				public ByteArrayOutputStream2() {
					super();
				}

				public ByteArrayOutputStream2(int size) {
					super(size);
				}

				/**
				 * Returns the internal buffer of this ByteArrayOutputStream, without copying.
				 */
				public synchronized byte[] buf() {
					return this.buf;
				}
			}
		}

		static class HttpRequestTask {
			private final CompleteCallback callback;
			private final Object context;

			public HttpRequestTask(CompleteCallback callback, Object context) {
				this.callback = callback;
				this.context = context;
			}

			protected RequestResult doInBackground(RequestOptions... params) {
				RequestResult result = new RequestResult();
				Stack<Closeable> openedStreams = new Stack<Closeable>();

				try {
					RequestOptions options = params[0];
					URL url = new URL(options.url);
					HttpURLConnection connection = (HttpURLConnection) url.openConnection();

					// set the request method
					String requestMethod = options.method != null ? options.method.toUpperCase(Locale.ENGLISH) : GET_METHOD;
					connection.setRequestMethod(requestMethod);

					// add the headers
					options.addHeaders(connection);

					// apply timeout
					if (options.timeout > 0) {
						connection.setConnectTimeout(options.timeout);
						connection.setReadTimeout(options.timeout);
					}

					// don't follow redirect (30x) responses; by default, HttpURLConnection follows them.
					if (options.dontFollowRedirects) {
						connection.setInstanceFollowRedirects(false);
					}

					options.writeContent(connection, openedStreams);

					// close the opened streams (saves copy-paste implementation
					// in each method that throws IOException)
					this.closeOpenedStreams(openedStreams);

					connection.connect();

					// build the result
					result.getHeaders(connection);
					result.url = options.url;
					result.statusCode = connection.getResponseCode();
					result.statusText = connection.getResponseMessage();
					if (!requestMethod.equals(HEAD_METHOD)) {
						result.readResponseStream(connection, openedStreams, options);
					}

					// close the opened streams (saves copy-paste implementation
					// in each method that throws IOException)
					this.closeOpenedStreams(openedStreams);

					connection.disconnect();

					return result;
				} catch (Exception e) // TODO: Catch all exceptions?
				{
					result.error = e;

					return result;
				} finally {
					try {
						this.closeOpenedStreams(openedStreams);
					} catch (IOException e) {
						Log.e(TAG, "Failed to close opened streams, IOException: " + e.getMessage());
					}
				}
			}

			protected void onPostExecute(final RequestResult result) {
				if (result != null) {
					this.callback.onComplete(result, this.context);
				} else {
					this.callback.onError("HttpRequestTask returns no result.", this.context);
				}
			}

			private void closeOpenedStreams(Stack<Closeable> streams) throws IOException {
				while (streams.size() > 0) {
					Closeable stream = streams.pop();
					stream.close();
				}
			}
		}
	}

	public static class File {

		static void updateValue(Context context, Uri uri) {
			try {
				ContentValues values = new ContentValues();
				if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
					context.getContentResolver().update(uri, values, null);
				} else {
					context.getContentResolver().update(uri, values, null, null);
				}
			} catch (Exception exception){
				Log.e(TAG, "Failed to updateValue: " + exception.getMessage());
			}
			
		}

		public static void append(final String path, final byte[] content, final CompleteCallback callback, final Object context) {
			final android.os.Handler mHandler = new android.os.Handler(Looper.myLooper());
			threadPoolExecutor().execute(new Runnable() {
				@Override
				public void run() {
					final AppendTask task = new AppendTask(callback, context);
					final boolean result = task.doInBackground(path, content);
					mHandler.post(new Runnable() {
						@Override
						public void run() {
							task.onPostExecute(result);
						}
					});
				}
			});
		}

		public static void appendBuffer(final String path, final ByteBuffer content, final CompleteCallback callback, final Object context) {
			final android.os.Handler mHandler = new android.os.Handler(Looper.myLooper());
			threadPoolExecutor().execute(new Runnable() {
				@Override
				public void run() {
					final AppendBufferTask task = new AppendBufferTask(callback, context);
					final boolean result = task.doInBackground(path, content);
					mHandler.post(new Runnable() {
						@Override
						public void run() {
							task.onPostExecute(result);
						}
					});
				}
			});
		}

		public static void appendText(final String path, final String content, final String encoding, final CompleteCallback callback, final Object context) {
			final android.os.Handler mHandler = new android.os.Handler(Looper.myLooper());
			threadPoolExecutor().execute(new Runnable() {
				@Override
				public void run() {
					final AppendTextTask task = new AppendTextTask(callback, context);
					final boolean result = task.doInBackground(path, content, encoding);
					mHandler.post(new Runnable() {
						@Override
						public void run() {
							task.onPostExecute(result);
						}
					});
				}
			});
		}

		public static boolean copySync(final String src, final String dest, final Context context) throws Exception {
			InputStream is;
			OutputStream os;
			boolean requiresUpdate = false;
			if(src.startsWith("content://")){
				is = context.getContentResolver().openInputStream(Uri.parse(src));
			}else is = new FileInputStream(new java.io.File(src));

			if(dest.startsWith("content://")){
				os = context.getContentResolver().openOutputStream(Uri.parse(dest));
				requiresUpdate = true;
			}else os = new FileOutputStream(new java.io.File(dest));

			boolean ret = copySync(is, os, context);

			if(ret && requiresUpdate){
				updateValue(context, Uri.parse(dest));
			}

			return ret;

		}

		public static boolean copySync(final InputStream src, final OutputStream dest, final Object context) throws Exception {
			ReadableByteChannel isc = java.nio.channels.Channels.newChannel(src);
			WritableByteChannel osc = java.nio.channels.Channels.newChannel(dest);

			int size = src.available();

			int written = fastChannelCopy(isc, osc);

			return size == written;
		}

		public static void copy(final String src, final String dest, final CompleteCallback callback, final Context context) {
			try {
				InputStream is;
				OutputStream os;

				boolean requiresUpdate = false;

				if(src.startsWith("content://")){
					is = context.getContentResolver().openInputStream(Uri.parse(src));
				}else is = new FileInputStream(new java.io.File(src));

				if(dest.startsWith("content://")){
					requiresUpdate = true;
					os = context.getContentResolver().openOutputStream(Uri.parse(dest));
				}else os = new FileOutputStream(new java.io.File(dest));

				boolean finalRequiresUpdate = requiresUpdate;
				copy(is, os, new CompleteCallback() {
					@Override
					public void onComplete(Object result, Object tag) {
						if(finalRequiresUpdate){
							updateValue(context, Uri.parse(dest));
						}
						callback.onComplete(result, tag);
					}

					@Override
					public void onError(String error, Object tag) {
						callback.onError(error, tag);
					}
				}, context);

			}catch (Exception exception){
				callback.onError(exception.getMessage(), context);
			}
		}

		private static int fastChannelCopy(final ReadableByteChannel src,
											final WritableByteChannel dest) throws IOException {
			int written = 0;
			final ByteBuffer buffer = ByteBuffer.allocateDirect(16 * 1024);
			while (src.read(buffer) != -1) {
				// prepare the buffer to be drained
				buffer.flip();
				// write to the channel, may block
				written += dest.write(buffer);
				// If partial transfer, shift remainder down
				// If buffer is empty, same as doing clear()
				buffer.compact();
			}
			// EOF will leave buffer in fill state
			buffer.flip();
			// make sure the buffer is fully drained.
			while (buffer.hasRemaining()) {
				written += dest.write(buffer);
			}
			return written;
		}

		public static void copy(final InputStream src, final OutputStream dest, final CompleteCallback callback, final Object context) {
			final android.os.Handler mHandler = new android.os.Handler(Looper.myLooper());
			threadPoolExecutor().execute((Runnable) () -> {

				boolean done = false;
				Exception error = null;
				try (InputStream is = src; OutputStream os = dest){
					ReadableByteChannel isc = java.nio.channels.Channels.newChannel(is);
					WritableByteChannel osc = java.nio.channels.Channels.newChannel(os);

					int size = src.available();

					int written = fastChannelCopy(isc, osc);

					done = size == written;

				} catch (Exception e) {
					error = e;

				}finally {
					if (error != null){
						Exception finalError = error;
						mHandler.post(() -> callback.onError(finalError.getMessage(), context));
					}else {
						boolean finalDone = done;
						mHandler.post(() -> callback.onComplete(finalDone, context));
					}
				}
			});
		}

		public static void readText(final String path, final String encoding, final CompleteCallback callback, final Object context) {
			final android.os.Handler mHandler = new android.os.Handler(Looper.myLooper());
			threadPoolExecutor().execute(new Runnable() {
				@Override
				public void run() {
					final ReadTextTask task = new ReadTextTask(callback, context);
					final String result = task.doInBackground(path, encoding);
					mHandler.post(new Runnable() {
						@Override
						public void run() {
							task.onPostExecute(result);
						}
					});
				}
			});
		}

		public static void read(final String path, final CompleteCallback callback, final Object context) {
			final android.os.Handler mHandler = new android.os.Handler(Looper.myLooper());
			threadPoolExecutor().execute(new Runnable() {
				@Override
				public void run() {
					final ReadTask task = new ReadTask(callback, context);
					final byte[] result = task.doInBackground(path);
					mHandler.post(new Runnable() {
						@Override
						public void run() {
							task.onPostExecute(result);
						}
					});
				}
			});
		}

		public static void readBuffer(final String path, final CompleteCallback callback, final Object context) {
			final android.os.Handler mHandler = new android.os.Handler(Looper.myLooper());
			threadPoolExecutor().execute(new Runnable() {
				@Override
				public void run() {
					final ReadBufferTask task = new ReadBufferTask(callback, context);
					final ByteBuffer result = task.doInBackground(path);
					mHandler.post(new Runnable() {
						@Override
						public void run() {
							task.onPostExecute(result);
						}
					});
				}
			});
		}

		public static void writeText(final String path, final String content, final String encoding, final CompleteCallback callback, final Object context) {
			final android.os.Handler mHandler = new android.os.Handler(Looper.myLooper());
			threadPoolExecutor().execute(new Runnable() {
				@Override
				public void run() {
					final WriteTextTask task = new WriteTextTask(callback, context);
					final boolean result = task.doInBackground(path, content, encoding);
					mHandler.post(new Runnable() {
						@Override
						public void run() {
							task.onPostExecute(result);
						}
					});
				}
			});
		}

		public static void write(final String path, final byte[] content, final CompleteCallback callback, final Object context) {
			final android.os.Handler mHandler = new android.os.Handler(Looper.myLooper());
			threadPoolExecutor().execute(new Runnable() {
				@Override
				public void run() {
					final WriteTask task = new WriteTask(callback, context);
					final boolean result = task.doInBackground(path, content);
					mHandler.post(new Runnable() {
						@Override
						public void run() {
							task.onPostExecute(result);
						}
					});
				}
			});
		}

		public static void writeBuffer(final String path, final ByteBuffer content, final CompleteCallback callback, final Object context) {
			final android.os.Handler mHandler = new android.os.Handler(Looper.myLooper());
			threadPoolExecutor().execute(new Runnable() {
				@Override
				public void run() {
					final WriteBufferTask task = new WriteBufferTask(callback, context);
					final boolean result = task.doInBackground(path, content);
					mHandler.post(new Runnable() {
						@Override
						public void run() {
							task.onPostExecute(result);
						}
					});
				}
			});
		}

		static class ReadTextTask {
			private final CompleteCallback callback;
			private final Object context;

			public ReadTextTask(CompleteCallback callback, Object context) {
				this.callback = callback;
				this.context = context;
			}

			protected String doInBackground(String... params) {
				java.io.File javaFile = new java.io.File(params[0]);
				FileInputStream stream = null;

				try {
					stream = new FileInputStream(javaFile);

					InputStreamReader reader = new InputStreamReader(stream, params[1]);

					CharBuffer buffer = CharBuffer.allocate(81920);
					StringBuilder sb = new StringBuilder();

					while (reader.read(buffer) != -1) {
						buffer.flip();
						sb.append(buffer);
						buffer.clear();
					}

					reader.close();

					return sb.toString();
				} catch (FileNotFoundException e) {
					Log.e(TAG, "Failed to read file, FileNotFoundException: " + e.getMessage());
					return null;
				} catch (UnsupportedEncodingException e) {
					Log.e(TAG, "Failed to read file, UnsupportedEncodingException: " + e.getMessage());
					return null;
				} catch (IOException e) {
					Log.e(TAG, "Failed to read file, IOException: " + e.getMessage());
					return null;
				} finally {
					if (stream != null) {
						try {
							stream.close();
						} catch (IOException e) {
							Log.e(TAG, "Failed to close stream, IOException: " + e.getMessage());
						}
					}
				}
			}

			protected void onPostExecute(final String result) {
				if (result != null) {
					this.callback.onComplete(result, this.context);
				} else {
					this.callback.onError("ReadTextTask returns no result.", this.context);
				}
			}
		}

		static class ReadTask {
			private final CompleteCallback callback;
			private final Object context;

			public ReadTask(CompleteCallback callback, Object context) {
				this.callback = callback;
				this.context = context;
			}

			protected byte[] doInBackground(String... params) {
				java.io.File javaFile = new java.io.File(params[0]);
				FileInputStream stream = null;

				try {
					stream = new FileInputStream(javaFile);

					byte[] result = new byte[(int) javaFile.length()];

					DataInputStream dataInputStream = new DataInputStream(stream);
					dataInputStream.readFully(result);

					return result;
				} catch (FileNotFoundException e) {
					Log.e(TAG, "Failed to read file, FileNotFoundException: " + e.getMessage());
					return null;
				} catch (IOException e) {
					Log.e(TAG, "Failed to read file, IOException: " + e.getMessage());
					return null;
				} finally {
					if (stream != null) {
						try {
							stream.close();
						} catch (IOException e) {
							Log.e(TAG, "Failed to close stream, IOException: " + e.getMessage());
						}
					}
				}
			}

			protected void onPostExecute(final byte[] result) {
				if (result != null) {
					this.callback.onComplete(result, this.context);
				} else {
					this.callback.onError("ReadTask returns no result.", this.context);
				}
			}
		}

		static class ReadBufferTask {
			private final CompleteCallback callback;
			private final Object context;

			public ReadBufferTask(CompleteCallback callback, Object context) {
				this.callback = callback;
				this.context = context;
			}

			protected ByteBuffer doInBackground(String... params) {
				java.io.File javaFile = new java.io.File(params[0]);
				FileInputStream stream = null;

				try {
					stream = new FileInputStream(javaFile);

					ByteBuffer buffer = ByteBuffer.allocateDirect((int) javaFile.length());

					FileChannel channel = stream.getChannel();
					channel.read(buffer);
					buffer.rewind();

					return buffer;
				} catch (FileNotFoundException e) {
					Log.e(TAG, "Failed to read file, FileNotFoundException: " + e.getMessage());
					return null;
				} catch (IOException e) {
					Log.e(TAG, "Failed to read file, IOException: " + e.getMessage());
					return null;
				} finally {
					if (stream != null) {
						try {
							stream.close();
						} catch (IOException e) {
							Log.e(TAG, "Failed to close stream, IOException: " + e.getMessage());
						}
					}
				}
			}

			protected void onPostExecute(final ByteBuffer result) {
				if (result != null) {
					this.callback.onComplete(result, this.context);
				} else {
					this.callback.onError("ReadTask returns no result.", this.context);
				}
			}
		}

		static class WriteTextTask {
			private final CompleteCallback callback;
			private final Object context;

			public WriteTextTask(CompleteCallback callback, Object context) {
				this.callback = callback;
				this.context = context;
			}

			protected boolean doInBackground(String... params) {
				java.io.File javaFile = new java.io.File(params[0]);
				FileOutputStream stream = null;
				try {
					stream = new FileOutputStream(javaFile);

					OutputStreamWriter writer = new OutputStreamWriter(stream, params[2]);
					writer.write(params[1]);
					writer.close();

					return true;
				} catch (FileNotFoundException e) {
					Log.e(TAG, "Failed to write file, FileNotFoundException: " + e.getMessage());
					return false;
				} catch (UnsupportedEncodingException e) {
					Log.e(TAG, "Failed to write file, UnsupportedEncodingException: " + e.getMessage());
					return false;
				} catch (IOException e) {
					Log.e(TAG, "Failed to write file, IOException: " + e.getMessage());
					return false;
				} finally {
					if (stream != null) {
						try {
							stream.close();
						} catch (IOException e) {
							Log.e(TAG, "Failed to close stream, IOException: " + e.getMessage());
						}
					}
				}
			}

			protected void onPostExecute(final boolean result) {
				if (result) {
					this.callback.onComplete(null, this.context);
				} else {
					this.callback.onError("WriteTextTask returns no result.", this.context);
				}
			}
		}

		static class WriteTask {
			private final CompleteCallback callback;
			private final Object context;

			public WriteTask(CompleteCallback callback, Object context) {
				this.callback = callback;
				this.context = context;
			}

			protected boolean doInBackground(Object... params) {
				java.io.File javaFile = new java.io.File((String) params[0]);
				FileOutputStream stream = null;
				byte[] content = (byte[]) params[1];

				try {
					stream = new FileOutputStream(javaFile);
					stream.write(content, 0, content.length);

					return true;
				} catch (FileNotFoundException e) {
					Log.e(TAG, "Failed to write file, FileNotFoundException: " + e.getMessage());
					return false;
				} catch (IOException e) {
					Log.e(TAG, "Failed to write file, IOException: " + e.getMessage());
					return false;
				} finally {
					if (stream != null) {
						try {
							stream.close();
						} catch (IOException e) {
							Log.e(TAG, "Failed to close stream, IOException: " + e.getMessage());
						}
					}
				}
			}

			protected void onPostExecute(final boolean result) {
				if (result) {
					this.callback.onComplete(null, this.context);
				} else {
					this.callback.onError("WriteTask returns no result.", this.context);
				}
			}
		}

		static class WriteBufferTask {
			private final CompleteCallback callback;
			private final Object context;

			public WriteBufferTask(CompleteCallback callback, Object context) {
				this.callback = callback;
				this.context = context;
			}

			protected boolean doInBackground(Object... params) {
				java.io.File javaFile = new java.io.File((String) params[0]);
				FileOutputStream stream = null;
				ByteBuffer content = (ByteBuffer) params[1];

				try {
					stream = new FileOutputStream(javaFile);
					FileChannel channel = stream.getChannel();
					content.rewind();
					channel.write(content);
					content.rewind();
					return true;
				} catch (FileNotFoundException e) {
					Log.e(TAG, "Failed to write file, FileNotFoundException: " + e.getMessage());
					return false;
				} catch (IOException e) {
					Log.e(TAG, "Failed to write file, IOException: " + e.getMessage());
					return false;
				} finally {
					if (stream != null) {
						try {
							stream.close();
						} catch (IOException e) {
							Log.e(TAG, "Failed to close stream, IOException: " + e.getMessage());
						}
					}
				}
			}

			protected void onPostExecute(final boolean result) {
				if (result) {
					this.callback.onComplete(null, this.context);
				} else {
					this.callback.onError("WriteTask returns no result.", this.context);
				}
			}
		}

		static class AppendTask {
			private final CompleteCallback callback;
			private final Object context;

			public AppendTask(CompleteCallback callback, Object context) {
				this.callback = callback;
				this.context = context;
			}

			protected boolean doInBackground(Object... params) {
				java.io.File javaFile = new java.io.File((String) params[0]);
				FileOutputStream stream = null;
				byte[] content = (byte[]) params[1];

				try {
					stream = new FileOutputStream(javaFile, true);
					stream.write(content, 0, content.length);

					return true;
				} catch (FileNotFoundException e) {
					Log.e(TAG, "Failed to append file, FileNotFoundException: " + e.getMessage());
					return false;
				} catch (IOException e) {
					Log.e(TAG, "Failed to write file, IOException: " + e.getMessage());
					return false;
				} finally {
					if (stream != null) {
						try {
							stream.close();
						} catch (IOException e) {
							Log.e(TAG, "Failed to close stream, IOException: " + e.getMessage());
						}
					}
				}
			}

			protected void onPostExecute(final boolean result) {
				if (result) {
					this.callback.onComplete(null, this.context);
				} else {
					this.callback.onError("AppendTask returns no result.", this.context);
				}
			}
		}

		static class AppendBufferTask {
			private final CompleteCallback callback;
			private final Object context;

			public AppendBufferTask(CompleteCallback callback, Object context) {
				this.callback = callback;
				this.context = context;
			}

			protected boolean doInBackground(Object... params) {
				java.io.File javaFile = new java.io.File((String) params[0]);
				FileOutputStream stream = null;
				ByteBuffer content = (ByteBuffer) params[1];

				try {
					stream = new FileOutputStream(javaFile, true);
					FileChannel channel = stream.getChannel();
					content.rewind();
					channel.write(content);
					content.rewind();
					return true;
				} catch (FileNotFoundException e) {
					Log.e(TAG, "Failed to append to file, FileNotFoundException: " + e.getMessage());
					return false;
				} catch (IOException e) {
					Log.e(TAG, "Failed to append file, IOException: " + e.getMessage());
					return false;
				} finally {
					if (stream != null) {
						try {
							stream.close();
						} catch (IOException e) {
							Log.e(TAG, "Failed to close stream, IOException: " + e.getMessage());
						}
					}
				}
			}

			protected void onPostExecute(final boolean result) {
				if (result) {
					this.callback.onComplete(null, this.context);
				} else {
					this.callback.onError("AppendTask returns no result.", this.context);
				}
			}
		}

		static class AppendTextTask {
			private final CompleteCallback callback;
			private final Object context;

			public AppendTextTask(CompleteCallback callback, Object context) {
				this.callback = callback;
				this.context = context;
			}

			protected boolean doInBackground(String... params) {
				java.io.File javaFile = new java.io.File(params[0]);
				FileOutputStream stream = null;
				try {
					stream = new FileOutputStream(javaFile, true);

					OutputStreamWriter writer = new OutputStreamWriter(stream, params[2]);
					writer.write(params[1]);
					writer.close();

					return true;
				} catch (FileNotFoundException e) {
					Log.e(TAG, "Failed to append file, FileNotFoundException: " + e.getMessage());
					return false;
				} catch (UnsupportedEncodingException e) {
					Log.e(TAG, "Failed to append file, UnsupportedEncodingException: " + e.getMessage());
					return false;
				} catch (IOException e) {
					Log.e(TAG, "Failed to append file, IOException: " + e.getMessage());
					return false;
				} finally {
					if (stream != null) {
						try {
							stream.close();
						} catch (IOException e) {
							Log.e(TAG, "Failed to close stream, IOException: " + e.getMessage());
						}
					}
				}
			}

			protected void onPostExecute(final boolean result) {
				if (result) {
					this.callback.onComplete(null, this.context);
				} else {
					this.callback.onError("AppendTextTask returns no result.", this.context);
				}
			}
		}

	}
}

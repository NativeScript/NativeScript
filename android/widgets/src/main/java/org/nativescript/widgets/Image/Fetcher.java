/*
 * Copyright (C) 2012 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.nativescript.widgets.image;

import android.content.Context;
import android.graphics.Bitmap;
import android.os.Build;
import android.util.Log;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileDescriptor;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * A simple subclass of {@link Resizer} that fetch and resize images from a file, resource or URL.
 */
public class Fetcher extends Resizer {
    private static final int HTTP_CACHE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final String HTTP_CACHE_DIR = "http";
    private static final int IO_BUFFER_SIZE = 8 * 1024;

    private File mHttpCacheDir;
    private DiskLruCache mHttpDiskCache;
    private boolean mHttpDiskCacheStarting = true;
    private final Object mHttpDiskCacheLock = new Object();
    private static final int DISK_CACHE_INDEX = 0;

    private final String mPackageName;
    private static Fetcher instance;

    public static Fetcher getInstance(Context context) {
        if (instance == null) {
            instance = new Fetcher(context);
        }

        return instance;
    }

    /**
     * Initialize providing a target image width and height for the processing images.
     *
     * @param context
     */
    private Fetcher(Context context) {
        super(context);
        mHttpCacheDir = Cache.getDiskCacheDir(context, HTTP_CACHE_DIR);
        mPackageName = context.getPackageName();
    }

    @Override
    protected void initDiskCacheInternal() {
        if (!mHttpCacheDir.exists()) {
            mHttpCacheDir.mkdirs();
        }
        synchronized (mHttpDiskCacheLock) {
            if (Cache.getUsableSpace(mHttpCacheDir) > HTTP_CACHE_SIZE) {
                try {
                    mHttpDiskCache = DiskLruCache.open(mHttpCacheDir, 1, 1, HTTP_CACHE_SIZE);
                    if (debuggable > 0) {
                        Log.v(TAG, "HTTP cache initialized");
                    }
                } catch (IOException e) {
                    mHttpDiskCache = null;
                }
            }
            mHttpDiskCacheStarting = false;
            mHttpDiskCacheLock.notifyAll();
        }
    }

    @Override
    protected void clearCacheInternal() {
        super.clearCacheInternal();
        synchronized (mHttpDiskCacheLock) {
            if (mHttpDiskCache != null && !mHttpDiskCache.isClosed()) {
                try {
                    mHttpDiskCache.delete();
                    if (debuggable > 0) {
                        Log.v(TAG, "HTTP cache cleared");
                    }
                } catch (IOException e) {
                    Log.e(TAG, "clearCacheInternal - " + e);
                }
                mHttpDiskCache = null;
                mHttpDiskCacheStarting = true;
            }
        }
    }

    @Override
    protected void flushCacheInternal() {
        synchronized (mHttpDiskCacheLock) {
            if (mHttpDiskCache != null) {
                try {
                    mHttpDiskCache.flush();
                    if (debuggable > 0) {
                        Log.v(TAG, "HTTP cache flushed");
                    }
                } catch (IOException e) {
                    Log.e(TAG, "flush - " + e);
                }
            }
        }
    }

    @Override
    protected void closeCacheInternal() {
        synchronized (mHttpDiskCacheLock) {
            if (mHttpDiskCache != null) {
                try {
                    if (!mHttpDiskCache.isClosed()) {
                        mHttpDiskCache.close();
                        mHttpDiskCache = null;
                        if (debuggable > 0) {
                            Log.v(TAG, "HTTP cache closed");
                        }
                    }
                } catch (IOException e) {
                    Log.e(TAG, "closeCacheInternal - " + e);
                }
            }
        }
    }

    /**
     * The main process method, which will be called by the Worker in the AsyncTask background
     * thread.
     *
     * @param data The data to load the bitmap, in this case, a regular http URL
     * @return The downloaded and resized bitmap
     */
    private Bitmap processHttp(String data, int decodeWidth, int decodeHeight) {
        if (debuggable > 0) {
            Log.v(TAG, "processHttp - " + data);
        }

        final String key = Cache.hashKeyForDisk(data);
        FileDescriptor fileDescriptor = null;
        FileInputStream fileInputStream = null;
        DiskLruCache.Snapshot snapshot;
        synchronized (mHttpDiskCacheLock) {
            // Wait for disk cache to initialize
            while (mHttpDiskCacheStarting) {
                try {
                    mHttpDiskCacheLock.wait();
                } catch (InterruptedException e) {
                }
            }

            if (mHttpDiskCache != null) {
                try {
                    snapshot = mHttpDiskCache.get(key);
                    if (snapshot == null) {
                        if (debuggable > 0) {
                            Log.v(TAG, "processBitmap, not found in http cache, downloading...");
                        }
                        DiskLruCache.Editor editor = mHttpDiskCache.edit(key);
                        if (editor != null) {
                            if (downloadUrlToStream(data,
                                    editor.newOutputStream(DISK_CACHE_INDEX))) {
                                editor.commit();
                            } else {
                                editor.abort();
                            }
                        }
                        snapshot = mHttpDiskCache.get(key);
                    }
                    if (snapshot != null) {
                        fileInputStream =
                                (FileInputStream) snapshot.getInputStream(DISK_CACHE_INDEX);
                        fileDescriptor = fileInputStream.getFD();
                    }
                } catch (IOException e) {
                    Log.e(TAG, "processHttp - " + e);
                } catch (IllegalStateException e) {
                    Log.e(TAG, "processHttp - " + e);
                } finally {
                    if (fileDescriptor == null && fileInputStream != null) {
                        try {
                            fileInputStream.close();
                        } catch (IOException e) {
                        }
                    }
                }
            }
        }

        Bitmap bitmap = null;
        if (fileDescriptor != null) {
            bitmap = decodeSampledBitmapFromDescriptor(fileDescriptor, decodeWidth,
                    decodeHeight, getCache());
        }
        if (fileInputStream != null) {
            try {
                fileInputStream.close();
            } catch (IOException e) {
            }
        }
        return bitmap;
    }

    private Bitmap processHttpNoCache(String data, int decodeWidth, int decodeHeight) {
        if (debuggable > 0) {
            Log.v(TAG, "processHttp - " + data);
        }

        ByteArrayOutputStreamInternal outputStream = null;
        Bitmap bitmap = null;

        try {
            outputStream = new ByteArrayOutputStreamInternal();
            if (downloadUrlToStream(data, outputStream)) {
                bitmap = decodeSampledBitmapFromByteArray(outputStream.getBuffer(),  decodeWidth, decodeHeight, getCache());
            }
        } catch (IllegalStateException e) {
            Log.e(TAG, "processHttpNoCache - " + e);
        } finally {
            if (outputStream != null) {
                try {
                    outputStream.close();
                } catch (IOException e) {
                }
            }
        }

        return bitmap;
    }

    @Override
    protected Bitmap processBitmap(Object data, int decodeWidth, int decodeHeight, boolean useCache) {
        if (data instanceof String) {
            String stringData = String.valueOf(data);
            if (stringData.startsWith(FILE_PREFIX)) {
                String filename = stringData.substring(FILE_PREFIX.length());
                if (debuggable > 0) {
                    Log.v(TAG, "processFile - " + filename);
                }
                return decodeSampledBitmapFromFile(filename, decodeWidth, decodeHeight, getCache());
            } else if (stringData.startsWith(RESOURCE_PREFIX)) {
                String resPath = stringData.substring(RESOURCE_PREFIX.length());
                int resId = mResources.getIdentifier(resPath, "drawable", mPackageName);
                if (resId > 0) {
                    if (debuggable > 0) {
                        Log.v(TAG, "processResource - " + resId);
                    }
                    return decodeSampledBitmapFromResource(mResources, resId, decodeWidth, decodeHeight, getCache());
                } else {
                    Log.v(TAG, "Missing Image with resourceID: " + stringData);
                }
            } else {
                if (useCache && mHttpDiskCache != null) {
                    return processHttp(stringData, decodeWidth, decodeHeight);
                } else {
                    return processHttpNoCache(stringData, decodeWidth, decodeHeight);
                }
            }
        } else {
            Log.v(TAG, "Invalid Value: " + String.valueOf(data));
        }

        return null;
    }

    /**
     * Download a bitmap from a URL and write the content to an output stream.
     *
     * @param urlString The URL to fetch
     * @return true if successful, false otherwise
     */
    public boolean downloadUrlToStream(String urlString, OutputStream outputStream) {
        disableConnectionReuseIfNecessary();
        HttpURLConnection urlConnection = null;
        BufferedOutputStream out = null;
        BufferedInputStream in = null;

        try {
            final URL url = new URL(urlString);
            urlConnection = (HttpURLConnection) url.openConnection();
            in = new BufferedInputStream(urlConnection.getInputStream(), IO_BUFFER_SIZE);
            out = new BufferedOutputStream(outputStream, IO_BUFFER_SIZE);

            int b;
            while ((b = in.read()) != -1) {
                out.write(b);
            }
            return true;
        } catch (final IOException e) {
            Log.e(TAG, "Error in downloadBitmap - " + e);
        } finally {
            if (urlConnection != null) {
                urlConnection.disconnect();
            }
            try {
                if (out != null) {
                    out.close();
                }
                if (in != null) {
                    in.close();
                }
            } catch (final IOException e) {
            }
        }
        return false;
    }

    /**
     * Workaround for bug pre-Froyo, see here for more info:
     * http://android-developers.blogspot.com/2011/09/androids-http-clients.html
     */
    public static void disableConnectionReuseIfNecessary() {
        // HTTP connection reuse which was buggy pre-froyo
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.FROYO) {
            System.setProperty("http.keepAlive", "false");
        }
    }

    private static class ByteArrayOutputStreamInternal extends ByteArrayOutputStream {
        public byte[] getBuffer() {
            return buf;
        }
    }
}

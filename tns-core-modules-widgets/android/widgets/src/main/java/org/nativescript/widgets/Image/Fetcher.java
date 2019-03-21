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

import android.annotation.TargetApi;
import android.content.Context;
import android.content.res.Resources;
import android.graphics.Matrix;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.ExifInterface;
import android.os.Build;
import android.util.Log;
import android.util.TypedValue;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileDescriptor;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * A simple subclass of {@link Worker} that fetch and resize images from a file, resource or URL.
 */
public class Fetcher extends Worker {
    private static final int HTTP_CACHE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final String HTTP_CACHE_DIR = "http";
    private static final int IO_BUFFER_SIZE = 8 * 1024;

    private static int mDeviceWidthPixels;
    private static int mDeviceHeightPixels;

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
        mDeviceWidthPixels  = (int) context.getResources().getDisplayMetrics().widthPixels;
        mDeviceHeightPixels  = (int) context.getResources().getDisplayMetrics().heightPixels;
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
    private Bitmap processHttp(String data, int decodeWidth, int decodeHeight, boolean keepAspectRatio) {
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
                            if (downloadUrlToStream(data, editor.newOutputStream(DISK_CACHE_INDEX))) {
                                editor.commit();
                            } else {
                                editor.abort();
                            }
                        }
                        snapshot = mHttpDiskCache.get(key);
                    }
                    if (snapshot != null) {
                        fileInputStream = (FileInputStream) snapshot.getInputStream(DISK_CACHE_INDEX);
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
            bitmap = decodeSampledBitmapFromDescriptor(fileDescriptor, decodeWidth, decodeHeight, keepAspectRatio,
                    getCache());
        }
        if (fileInputStream != null) {
            try {
                fileInputStream.close();
            } catch (IOException e) {
            }
        }
        return bitmap;
    }

    private Bitmap processHttpNoCache(String data, int decodeWidth, int decodeHeight, boolean keepAspectRatio) {
        ByteArrayOutputStreamInternal outputStream = null;
        Bitmap bitmap = null;

        try {
            outputStream = new ByteArrayOutputStreamInternal();
            if (downloadUrlToStream(data, outputStream)) {
                bitmap = decodeSampledBitmapFromByteArray(outputStream.getBuffer(), decodeWidth, decodeHeight,
                        keepAspectRatio, getCache());
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
    protected Bitmap processBitmap(String uri, int decodeWidth, int decodeHeight, boolean keepAspectRatio,
            boolean useCache) {
        if (debuggable > 0) {
            Log.v(TAG, "process: " + uri);
        }

        if (uri.startsWith(FILE_PREFIX)) {
            String filename = uri.substring(FILE_PREFIX.length());
            return decodeSampledBitmapFromFile(filename, decodeWidth, decodeHeight, keepAspectRatio, getCache());
        } else if (uri.startsWith(RESOURCE_PREFIX)) {
            String resPath = uri.substring(RESOURCE_PREFIX.length());
            int resId = mResources.getIdentifier(resPath, "drawable", mPackageName);
            if (resId > 0) {
                return decodeSampledBitmapFromResource(mResources, resId, decodeWidth, decodeHeight, keepAspectRatio,
                        getCache());
            } else {
                Log.v(TAG, "Missing Image with resourceID: " + uri);
                return null;
            }
        } else {
            if (useCache && mHttpDiskCache != null) {
                return processHttp(uri, decodeWidth, decodeHeight, keepAspectRatio);
            } else {
                return processHttpNoCache(uri, decodeWidth, decodeHeight, keepAspectRatio);
            }
        }
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

    /**
     * Decode and sample down a bitmap from resources to the requested width and height.
     *
     * @param res The resources object containing the image data
     * @param resId The resource id of the image data
     * @param reqWidth The requested width of the resulting bitmap
     * @param reqHeight The requested height of the resulting bitmap
     * @param cache The Cache used to find candidate bitmaps for use with inBitmap
     * @return A bitmap sampled down from the original with the same aspect ratio and dimensions
     *         that are equal to or greater than the requested width and height
     */
    public static Bitmap decodeSampledBitmapFromResource(Resources res, int resId, int reqWidth, int reqHeight,
            boolean keepAspectRatio, Cache cache) {

        // BEGIN_INCLUDE (read_bitmap_dimensions)
        // First decode with inJustDecodeBounds=true to check dimensions
        final BitmapFactory.Options options = new BitmapFactory.Options();
        options.inJustDecodeBounds = true;
        BitmapFactory.decodeResource(res, resId, options);

        options.inSampleSize = calculateInSampleSize(options.outWidth, options.outHeight, reqWidth, reqHeight);

        // END_INCLUDE (read_bitmap_dimensions)

        // If we're running on Honeycomb or newer, try to use inBitmap
        if (Utils.hasHoneycomb()) {
            addInBitmapOptions(options, cache);
        }

        // Decode bitmap with inSampleSize set
        options.inJustDecodeBounds = false;
        Bitmap bitmap = null;
        InputStream is = null;

        try {
            final TypedValue value = new TypedValue();
            is = res.openRawResource(resId, value);

            bitmap = BitmapFactory.decodeResourceStream(res, value, is, null, options);
        } catch (Exception e) {
            /*  do nothing.
                If the exception happened on open, bm will be null.
                If it happened on close, bm is still valid.
            */
        }

        if (bitmap == null && options != null && options.inBitmap != null) {
            throw new IllegalArgumentException("Problem decoding into existing bitmap");
        }

        ExifInterface ei = getExifInterface(is);

        return scaleAndRotateBitmap(bitmap, ei, reqWidth, reqHeight, keepAspectRatio);
    }

    @TargetApi(Build.VERSION_CODES.N)
    private static ExifInterface getExifInterface(InputStream is) {
        ExifInterface ei = null;
        try {
            if (Utils.hasN()) {
                ei = new ExifInterface(is);
            }
        } catch (final Exception e) {
            Log.e(TAG, "Error in reading bitmap - " + e);
        } finally {
            if (is != null) {
                try {
                    is.close();
                } catch (IOException e) {
                }
            }
        }

        return ei;
    }

    @TargetApi(Build.VERSION_CODES.N)
    private static ExifInterface getExifInterface(FileDescriptor fd) {
        ExifInterface ei = null;
        try {
            if (Utils.hasN()) {
                ei = new ExifInterface(fd);
            }
        } catch (final Exception e) {
            Log.e(TAG, "Error in reading bitmap - " + e);
        }

        return ei;
    }

    private static ExifInterface getExifInterface(String fileName) {
        ExifInterface ei = null;
        try {
            ei = new ExifInterface(fileName);
        } catch (final Exception e) {
            Log.e(TAG, "Error in reading bitmap - " + e);
        }

        return ei;
    }

    /**
     * Decode and sample down a bitmap from a file to the requested width and height.
     *
     * @param filename The full path of the file to decode
     * @param reqWidth The requested width of the resulting bitmap
     * @param reqHeight The requested height of the resulting bitmap
     * @param cache The Cache used to find candidate bitmaps for use with inBitmap
     * @return A bitmap sampled down from the original with the same aspect ratio and dimensions
     *         that are equal to or greater than the requested width and height
     */
    public static Bitmap decodeSampledBitmapFromFile(String fileName, int reqWidth, int reqHeight,
            boolean keepAspectRatio, Cache cache) {

        // First decode with inJustDecodeBounds=true to check dimensions
        final BitmapFactory.Options options = new BitmapFactory.Options();
        options.inJustDecodeBounds = true;
        BitmapFactory.decodeFile(fileName, options);

        options.inSampleSize = calculateInSampleSize(options.outWidth, options.outHeight, reqWidth, reqHeight);

        // If we're running on Honeycomb or newer, try to use inBitmap
        if (Utils.hasHoneycomb()) {
            addInBitmapOptions(options, cache);
        }

        // Decode bitmap with inSampleSize set
        options.inJustDecodeBounds = false;

        final Bitmap bitmap = BitmapFactory.decodeFile(fileName, options);
        ExifInterface ei = getExifInterface(fileName);

        return scaleAndRotateBitmap(bitmap, ei, reqWidth, reqHeight, keepAspectRatio);
    }

    private static Bitmap scaleAndRotateBitmap(Bitmap bitmap, ExifInterface ei, int reqWidth, int reqHeight,
            boolean keepAspectRatio) {
        if (bitmap == null) {
            return null;
        }

        int sourceWidth = bitmap.getWidth();
        int sourceHeight = bitmap.getHeight();
        reqWidth = reqWidth > 0 ? reqWidth : Math.min(sourceWidth, mDeviceWidthPixels);
        reqHeight = reqHeight > 0 ? reqHeight : Math.min(sourceHeight, mDeviceHeightPixels);

        // scale
        if (reqWidth != sourceWidth || reqHeight != sourceHeight) {
            if (keepAspectRatio) {
                double widthCoef = (double) sourceWidth / (double) reqWidth;
                double heightCoef = (double) sourceHeight / (double) reqHeight;
                double aspectCoef = Math.min(widthCoef, heightCoef);

                reqWidth = (int) Math.floor(sourceWidth / aspectCoef);
                reqHeight = (int) Math.floor(sourceHeight / aspectCoef);
            }

            bitmap = Bitmap.createScaledBitmap(bitmap, reqWidth, reqHeight, true);
        }

        // rotate
        if (ei != null) {
            final Matrix matrix = new Matrix();
            final int rotationAngle = calculateRotationAngle(ei);
            if (rotationAngle != 0) {
                matrix.postRotate(rotationAngle);
                bitmap = Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
            }
        }

        return bitmap;
    }

    private static int calculateRotationAngle(ExifInterface ei) {
        int rotationAngle = 0;
        final int orientation = ei.getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL);

        switch (orientation) {
        case ExifInterface.ORIENTATION_ROTATE_90:
            rotationAngle = 90;
            break;
        case ExifInterface.ORIENTATION_ROTATE_180:
            rotationAngle = 180;
            break;
        case ExifInterface.ORIENTATION_ROTATE_270:
            rotationAngle = 270;
            break;
        }

        return rotationAngle;
    }

    /**
     * Decode and sample down a bitmap from a file input stream to the requested width and height.
     *
     * @param fileDescriptor The file descriptor to read from
     * @param reqWidth The requested width of the resulting bitmap
     * @param reqHeight The requested height of the resulting bitmap
     * @param cache The Cache used to find candidate bitmaps for use with inBitmap
     * @return A bitmap sampled down from the original with the same aspect ratio and dimensions
     *         that are equal to or greater than the requested width and height
     */
    public static Bitmap decodeSampledBitmapFromDescriptor(FileDescriptor fileDescriptor, int reqWidth, int reqHeight,
            boolean keepAspectRatio, Cache cache) {

        // First decode with inJustDecodeBounds=true to check dimensions
        final BitmapFactory.Options options = new BitmapFactory.Options();
        options.inJustDecodeBounds = true;
        BitmapFactory.decodeFileDescriptor(fileDescriptor, null, options);

        options.inSampleSize = calculateInSampleSize(options.outWidth, options.outHeight, reqWidth, reqHeight);

        // Decode bitmap with inSampleSize set
        options.inJustDecodeBounds = false;

        // If we're running on Honeycomb or newer, try to use inBitmap
        if (Utils.hasHoneycomb()) {
            addInBitmapOptions(options, cache);
        }

        Bitmap results = null;
        try {
            // This can throw an error on a corrupted image when using an inBitmap
            results = BitmapFactory.decodeFileDescriptor(fileDescriptor, null, options);
        } catch (Exception e) {
            // clear the inBitmap and try again
            options.inBitmap = null;
            results = BitmapFactory.decodeFileDescriptor(fileDescriptor, null, options);
            // If image is broken, rather than an issue with the inBitmap, we will get a NULL out in this case...
        }

        ExifInterface ei = getExifInterface(fileDescriptor);

        return scaleAndRotateBitmap(results, ei, reqWidth, reqHeight, keepAspectRatio);
    }

    public static Bitmap decodeSampledBitmapFromByteArray(byte[] buffer, int reqWidth, int reqHeight,
            boolean keepAspectRatio, Cache cache) {

        // First decode with inJustDecodeBounds=true to check dimensions
        final BitmapFactory.Options options = new BitmapFactory.Options();
        options.inJustDecodeBounds = true;
        BitmapFactory.decodeByteArray(buffer, 0, buffer.length, options);

        options.inSampleSize = calculateInSampleSize(options.outWidth, options.outHeight, reqWidth, reqHeight);

        // Decode bitmap with inSampleSize set
        options.inJustDecodeBounds = false;

        // If we're running on Honeycomb or newer, try to use inBitmap
        if (Utils.hasHoneycomb()) {
            addInBitmapOptions(options, cache);
        }

        final Bitmap bitmap = BitmapFactory.decodeByteArray(buffer, 0, buffer.length, options);

        InputStream is = new ByteArrayInputStream(buffer);
        ExifInterface ei = getExifInterface(is);

        return scaleAndRotateBitmap(bitmap, ei, reqWidth, reqHeight, keepAspectRatio);
    }

    /**
     * Calculate an inSampleSize for use in a {@link BitmapFactory.Options} object when decoding
     * bitmaps using the decode* methods from {@link BitmapFactory}. This implementation calculates
     * the closest inSampleSize that is a power of 2 and will result in the final decoded bitmap
     * having a width and height equal to or larger than the requested width and height.
     *
     * @param imageWidth The original width of the resulting bitmap
     * @param imageHeight The original height of the resulting bitmap
     * @param reqWidth The requested width of the resulting bitmap
     * @param reqHeight The requested height of the resulting bitmap
     * @return The value to be used for inSampleSize
     */
    public static int calculateInSampleSize(int imageWidth, int imageHeight, int reqWidth, int reqHeight) {
        // BEGIN_INCLUDE (calculate_sample_size)
        // Raw height and width of image
        final int height = imageHeight;
        final int width = imageWidth;
        reqWidth = reqWidth > 0 ? reqWidth : width;
        reqHeight = reqHeight > 0 ? reqHeight : height;
        int inSampleSize = 1;
        if (height > reqHeight || width > reqWidth) {

            final int halfHeight = height / 2;
            final int halfWidth = width / 2;

            // Calculate the largest inSampleSize value that is a power of 2 and keeps both
            // height and width larger than the requested height and width.
            while ((halfHeight / inSampleSize) > reqHeight && (halfWidth / inSampleSize) > reqWidth) {
                inSampleSize *= 2;
            }

            // This offers some additional logic in case the image has a strange
            // aspect ratio. For example, a panorama may have a much larger
            // width than height. In these cases the total pixels might still
            // end up being too large to fit comfortably in memory, so we should
            // be more aggressive with sample down the image (=larger inSampleSize).

            long totalPixels = (width / inSampleSize) * (height / inSampleSize);

            // Anything more than 2x the requested pixels we'll sample down further
            final long totalReqPixelsCap = reqWidth * reqHeight * 2;

            while (totalPixels > totalReqPixelsCap) {
                inSampleSize *= 2;
                totalPixels = (width / inSampleSize) * (height / inSampleSize);
            }
        }
        return inSampleSize;
        // END_INCLUDE (calculate_sample_size)
    }

    @TargetApi(Build.VERSION_CODES.HONEYCOMB)
    private static void addInBitmapOptions(BitmapFactory.Options options, Cache cache) {
        //BEGIN_INCLUDE(add_bitmap_options)
        // inBitmap only works with mutable bitmaps so force the decoder to
        // return mutable bitmaps.
        options.inMutable = true;

        if (cache != null) {
            // Try and find a bitmap to use for inBitmap
            Bitmap inBitmap = cache.getBitmapFromReusableSet(options);

            if (inBitmap != null) {
                options.inBitmap = inBitmap;
            }
        }
        //END_INCLUDE(add_bitmap_options)
    }
}
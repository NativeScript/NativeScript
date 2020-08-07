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
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.util.Log;
import android.widget.ImageView;
import java.lang.ref.WeakReference;

/**
 * This class wraps up completing some arbitrary long running work when loading a bitmap to an
 * ImageView. It handles things like using a memory and disk cache, running the work in a background
 * thread and setting a placeholder image.
 */
public abstract class Worker {

    protected static final String RESOURCE_PREFIX = "res://";
    protected static final String FILE_PREFIX = "file:///";

    static final String TAG = "JS";
    private static final int FADE_IN_TIME = 200;

    private Cache mCache;
    private Bitmap mLoadingBitmap;
    private boolean mFadeInBitmap = true;
    private boolean mExitTasksEarly = false;
    private final Object mPauseWorkLock = new Object();

    protected boolean mPauseWork = false;
    protected Resources mResources;

    private static final int MESSAGE_CLEAR = 0;
    private static final int MESSAGE_INIT_DISK_CACHE = 1;
    private static final int MESSAGE_FLUSH = 2;
    private static final int MESSAGE_CLOSE = 3;

    protected static int debuggable = -1;

    protected Worker(Context context) {
        mResources = context.getResources();

        // Negative means not initialized.
        if (debuggable < 0) {
            try {
                ApplicationInfo ai = context.getPackageManager().getApplicationInfo(context.getPackageName(), android.content.pm.PackageManager.GET_META_DATA);
                android.os.Bundle bundle = ai.metaData;
                Boolean debugLayouts = bundle != null ? bundle.getBoolean("debugImageCache", false) : false;
                debuggable = debugLayouts ? 1 : 0;
            } catch (PackageManager.NameNotFoundException e) {
                debuggable = 0;
                Log.e(TAG, "Failed to load meta-data, NameNotFound: " + e.getMessage());
            } catch (NullPointerException e) {
                debuggable = 0;
                Log.e(TAG, "Failed to load meta-data, NullPointer: " + e.getMessage());
            }
        }
    }

    public void removeBitmap(String uri) {
        if (mCache != null) {
            mCache.reduceDisplayedCounter(uri);
        }
    }

    /**
     * Load an image specified by the data parameter into an ImageView (override
     * {@link Worker#processBitmap(String, int, int, boolean)} to define the processing logic). A memory and
     * disk cache will be used if an {@link Cache} has been added using
     * {@link Worker#addImageCache(Cache)}. If the
     * image is found in the memory cache, it is set immediately, otherwise an {@link AsyncTask}
     * will be created to asynchronously load the bitmap.
     *
     * @param uri The URI of the image to download.
     * @param owner The owner to bind the downloaded image to.
     * @param listener A listener that will be called back once the image has been loaded.
     */
    public void loadImage(String uri, BitmapOwner owner, int decodeWidth, int decodeHeight, boolean keepAspectRatio, boolean useCache, boolean async, OnImageLoadedListener listener) {
        if (uri == null) {
            return;
        }

        Bitmap value = null;
        String cacheUri = uri;

        if (debuggable > 0) {
            Log.v(TAG, "loadImage on: " + owner + " to: " + uri);
        }

        if (mCache != null && useCache) {
            // Create new image cache for images with different decodeHeight/decodeWidth.
            cacheUri = createCacheUri(uri, decodeHeight, decodeWidth);

            value = mCache.getBitmapFromMemCache(cacheUri);
        }

        if (value == null && !async) {
            // Decode sync.
            value = processBitmap(uri, decodeWidth, decodeHeight, keepAspectRatio, useCache);
            if (value != null) {
                if (mCache != null && useCache) {
                    if (debuggable > 0) {
                        Log.v(TAG, "loadImage.addBitmapToCache: " + owner + ", src: " + cacheUri);
                    }
                    mCache.addBitmapToCache(cacheUri, value);
                }
            }
        }

        if (value != null) {
            // Bitmap found in memory cache or loaded sync.
            if (debuggable > 0) {
                Log.v(TAG, "Set ImageBitmap on: " + owner + " to: " + uri);
            }
            owner.setBitmap(value);
            if (listener != null) {
                if (debuggable > 0) {
                    Log.v(TAG, "OnImageLoadedListener on: " + owner + " to: " + uri);
                }
                listener.onImageLoaded(true);
            }
        } else if (cancelPotentialWork(uri, owner)) {
            final BitmapWorkerTask task = new BitmapWorkerTask(uri, owner, decodeWidth, decodeHeight, keepAspectRatio, useCache, listener);
            final AsyncDrawable asyncDrawable =
                    new AsyncDrawable(mResources, mLoadingBitmap, task);
            owner.setDrawable(asyncDrawable);

            // NOTE: This uses a custom version of AsyncTask that has been pulled from the
            // framework and slightly modified. Refer to the docs at the top of the class
            // for more info on what was changed.
            task.executeOnExecutor(AsyncTask.DUAL_THREAD_EXECUTOR);
        }
    }

    /**
     * Set placeholder bitmap that shows when the the background thread is running.
     *
     * @param bitmap
     */
    public void setLoadingImage(Bitmap bitmap) {
        mLoadingBitmap = bitmap;
    }

    /**
     * Set placeholder bitmap that shows when the the background thread is running.
     *
     * @param resId
     */
    public void setLoadingImage(int resId) {
        mLoadingBitmap = BitmapFactory.decodeResource(mResources, resId);
    }

    /**
     * Adds an {@link Cache} to this {@link Worker} to handle disk and memory bitmap
     * caching. ImageCahce should be initialized before it is passed as parameter.
     */
    public void addImageCache(Cache imageCache) {
        this.mCache = imageCache;
    }

    /**
     * If set to true, the image will fade-in once it has been loaded by the background thread.
     */
    public void setImageFadeIn(boolean fadeIn) {
        mFadeInBitmap = fadeIn;
    }

    public void setExitTasksEarly(boolean exitTasksEarly) {
        mExitTasksEarly = exitTasksEarly;
        setPauseWork(false);
    }

    /**
     * Subclasses should override this to define any processing or work that must happen to produce
     * the final bitmap. This will be executed in a background thread and be long running. For
     * example, you could resize a large bitmap here, or pull down an image from the network.
     *
     * @param uri The URI to identify which image to process, as provided by
     *            {@link Worker#loadImage(String, BitmapOwner, int, int, boolean, boolean, OnImageLoadedListener)}
     * @return The processed bitmap
     */
    protected abstract Bitmap processBitmap(String uri, int decodeWidth, int decodeHeight, boolean keepAspectRatio, boolean useCache);

    /**
     * @return The {@link Cache} object currently being used by this Worker.
     */
    protected Cache getCache() {
        return mCache;
    }

    /**
     * Cancels any pending work attached to the provided ImageView.
     * @param owner
     */
    public static void cancelWork(BitmapOwner owner) {
        final BitmapWorkerTask bitmapWorkerTask = getBitmapWorkerTask(owner);
        if (bitmapWorkerTask != null) {
            bitmapWorkerTask.cancel(true);
            if (debuggable > 0) {
                Log.v(TAG, "cancelWork - cancelled work for " + bitmapWorkerTask.mUri);
            }
        }
    }

    /**
     * Returns true if the current work has been canceled or if there was no work in
     * progress on this image view.
     * Returns false if the work in progress deals with the same data. The work is not
     * stopped in that case.
     */
    public static boolean cancelPotentialWork(String uri, BitmapOwner owner) {
        final BitmapWorkerTask bitmapWorkerTask = getBitmapWorkerTask(owner);

        if (bitmapWorkerTask != null) {
            final String mUri = bitmapWorkerTask.mUri;
            if (mUri == null || !mUri.equals(uri)) {
                bitmapWorkerTask.cancel(true);
                if (debuggable > 0) {
                    Log.v(TAG, "cancelPotentialWork - cancelled work for " + uri);
                }
            } else {
                // The same work is already in progress.
                return false;
            }
        }
        return true;
    }

    /**
     * @param owner The owner that requested the bitmap;
     * @return Retrieve the currently active work task (if any) associated with this imageView.
     * null if there is no such task.
     */
    private static BitmapWorkerTask getBitmapWorkerTask(BitmapOwner owner) {
        if (owner != null) {
            final Drawable drawable = owner.getDrawable();
            if (drawable instanceof AsyncDrawable) {
                final AsyncDrawable asyncDrawable = (AsyncDrawable) drawable;
                return asyncDrawable.getBitmapWorkerTask();
            }
        }
        return null;
    }

    /**
     * Create cache key depending on image uri and decode properties.
     */
    private static String createCacheUri(String uri, int decodeHeight, int decodeWidth) {
        uri += decodeHeight != 0 ? "height%%" + String.valueOf(decodeHeight): "";
        uri += decodeWidth != 0 ? "width%%" + String.valueOf(decodeWidth): "";

        return uri;
    }

    /**
     * The actual AsyncTask that will asynchronously process the image.
     */
    private class BitmapWorkerTask extends AsyncTask<Void, Void, Bitmap> {
        private int mDecodeWidth;
        private int mDecodeHeight;
        private boolean mKeepAspectRatio;
        private String mUri;
        private String mCacheUri;
        private boolean mCacheImage;
        private final WeakReference<BitmapOwner> imageViewReference;
        private final OnImageLoadedListener mOnImageLoadedListener;

        public BitmapWorkerTask(String uri, BitmapOwner owner, int decodeWidth, int decodeHeight, boolean keepAspectRatio, boolean cacheImage) {
            this(uri, owner, decodeWidth, decodeHeight, keepAspectRatio, cacheImage, null);
        }

        public BitmapWorkerTask(String uri, BitmapOwner owner, int decodeWidth, int decodeHeight, boolean keepAspectRatio, boolean cacheImage, OnImageLoadedListener listener) {
            mDecodeWidth = decodeWidth;
            mDecodeHeight = decodeHeight;
            mKeepAspectRatio = keepAspectRatio;
            mCacheImage = cacheImage;
            mUri = uri;
            mCacheUri = createCacheUri(uri, decodeHeight, decodeWidth);
            imageViewReference = new WeakReference<BitmapOwner>(owner);
            mOnImageLoadedListener = listener;
        }

        /**
         * Background processing.
         */
        @Override
        protected Bitmap doInBackground(Void... params) {
            if (debuggable > 0) {
                Log.v(TAG, "doInBackground - starting work: " + imageViewReference.get() + ", on: " + mUri);
            }


            Bitmap bitmap = null;

            // Wait here if work is paused and the task is not cancelled
            synchronized (mPauseWorkLock) {
                while (mPauseWork && !isCancelled()) {
                    try {
                        mPauseWorkLock.wait();
                    } catch (InterruptedException e) {}
                }
            }

            // If the bitmap was not found in the cache and this task has not been cancelled by
            // another thread and the ImageView that was originally bound to this task is still
            // bound back to this task and our "exit early" flag is not set, then call the main
            // process method (as implemented by a subclass)
            if (bitmap == null && !isCancelled() && getAttachedOwner() != null
                    && !mExitTasksEarly) {
                bitmap = processBitmap(mUri, mDecodeWidth, mDecodeHeight, mKeepAspectRatio, mCacheImage);
            }

            // If the bitmap was processed and the image cache is available, then add the processed
            // bitmap to the cache for future use. Note we don't check if the task was cancelled
            // here, if it was, and the thread is still running, we may as well add the processed
            // bitmap to our cache as it might be used again in the future
            if (bitmap != null) {
                if (mCache != null && mCacheImage) {
                    if (debuggable > 0) {
                        Log.v(TAG, "addBitmapToCache: " + imageViewReference.get() + ", src: " + mCacheUri);
                    }
                    mCache.addBitmapToCache(mCacheUri, bitmap);
                }
            }

            if (debuggable > 0) {
                Log.v(TAG, "doInBackground - finished work");
            }

            return bitmap;
        }

        /**
         * Once the image is processed, associates it to the imageView
         */
        @Override
        protected void onPostExecute(Bitmap value) {
            boolean success = false;
            // if cancel was called on this task or the "exit early" flag is set then we're done
            if (isCancelled() || mExitTasksEarly) {
                value = null;
            }

            if (debuggable > 0) {
                Log.v(TAG, "onPostExecute - setting bitmap for: " + imageViewReference.get() + " src: " + mUri);
            }

            final BitmapOwner owner = getAttachedOwner();
            if (debuggable > 0) {
                Log.v(TAG, "onPostExecute - current ImageView: " + owner);
            }

            if (value != null && owner != null) {
                success = true;
                if (debuggable > 0) {
                    Log.v(TAG, "Set ImageDrawable on: " + owner + " to: " + mUri);
                }
                owner.setBitmap(value);
            }

            if (mOnImageLoadedListener != null) {
                if (debuggable > 0) {
                    Log.v(TAG, "OnImageLoadedListener on: " + owner + " to: " + mUri);
                }
                mOnImageLoadedListener.onImageLoaded(success);
            }
        }

        @Override
        protected void onCancelled(Bitmap value) {
            super.onCancelled(value);
            synchronized (mPauseWorkLock) {
                mPauseWorkLock.notifyAll();
            }
        }

        /**
         * Returns the ImageView associated with this task as long as the ImageView's task still
         * points to this task as well. Returns null otherwise.
         */
        private BitmapOwner getAttachedOwner() {
            final BitmapOwner owner = imageViewReference.get();
            final BitmapWorkerTask bitmapWorkerTask = getBitmapWorkerTask(owner);

            if (this == bitmapWorkerTask) {
                return owner;
            }

            return null;
        }
    }

    /**
     * Interface definition for callback on image loaded successfully.
     */
    public interface OnImageLoadedListener {

        /**
         * Called once the image has been loaded.
         * @param success True if the image was loaded successfully, false if
         *                there was an error.
         */
        void onImageLoaded(boolean success);
    }

    /**
     * A custom Drawable that will be attached to the imageView while the work is in progress.
     * Contains a reference to the actual worker task, so that it can be stopped if a new binding is
     * required, and makes sure that only the last started worker process can bind its result,
     * independently of the finish order.
     */
    private static class AsyncDrawable extends BitmapDrawable {
        private final WeakReference<BitmapWorkerTask> bitmapWorkerTaskReference;

        public AsyncDrawable(Resources res, Bitmap bitmap, BitmapWorkerTask bitmapWorkerTask) {
            super(res, bitmap);
            bitmapWorkerTaskReference =
                new WeakReference<BitmapWorkerTask>(bitmapWorkerTask);
        }

        public BitmapWorkerTask getBitmapWorkerTask() {
            return bitmapWorkerTaskReference.get();
        }
    }

//    /**
//     * Called when the processing is complete and the final drawable should be
//     * set on the ImageView.
//     *
//     * @param imageView
//     * @param bitmap
//     */
//    private void setImageDrawable(ImageView imageView, Bitmap bitmap) {
//        if (mFadeInBitmap) {
//            // Transition drawable with a transparent drawable and the final drawable
//            final TransitionDrawable td =
//                    new TransitionDrawable(new Drawable[] {
//                            new ColorDrawable(0),
//                            new BitmapDrawable(bitmap)
//                    });
//            // Set background to loading bitmap
//            imageView.setBackgroundDrawable(
//                    new BitmapDrawable(mResources, mLoadingBitmap));
//
//            imageView.setImageDrawable(td);
//            td.startTransition(FADE_IN_TIME);
//        } else {
//            imageView.setImageBitmap(bitmap);
//        }
//    }

    /**
     * Pause any ongoing background work. This can be used as a temporary
     * measure to improve performance. For example background work could
     * be paused when a ListView or GridView is being scrolled using a
     * {@link android.widget.AbsListView.OnScrollListener} to keep
     * scrolling smooth.
     * <p>
     * If work is paused, be sure setPauseWork(false) is called again
     * before your fragment or activity is destroyed (for example during
     * {@link android.app.Activity#onPause()}), or there is a risk the
     * background thread will never finish.
     */
    public void setPauseWork(boolean pauseWork) {
        synchronized (mPauseWorkLock) {
            mPauseWork = pauseWork;
            if (!mPauseWork) {
                mPauseWorkLock.notifyAll();
            }
        }
    }

    class CacheAsyncTask extends AsyncTask<Object, Void, Void> {

        @Override
        protected Void doInBackground(Object... params) {
            switch ((Integer)params[0]) {
                case MESSAGE_CLEAR:
                    clearCacheInternal();
                    break;
                case MESSAGE_INIT_DISK_CACHE:
                    initDiskCacheInternal();
                    break;
                case MESSAGE_FLUSH:
                    flushCacheInternal();
                    break;
                case MESSAGE_CLOSE:
                    closeCacheInternal();
                    break;
            }
            return null;
        }
    }

    protected void clearCacheInternal() {
        if (mCache != null) {
            mCache.clearCache();
        }
    }

    protected abstract void initDiskCacheInternal();

    protected abstract void flushCacheInternal();

    protected abstract void closeCacheInternal();

    public void initCache() {
        new CacheAsyncTask().execute(MESSAGE_INIT_DISK_CACHE);
    }

    public void clearCache() {
        new CacheAsyncTask().execute(MESSAGE_CLEAR);
    }

    public void flushCache() {
        new CacheAsyncTask().execute(MESSAGE_FLUSH);
    }

    public void closeCache() {
        new CacheAsyncTask().execute(MESSAGE_CLOSE);
    }
}
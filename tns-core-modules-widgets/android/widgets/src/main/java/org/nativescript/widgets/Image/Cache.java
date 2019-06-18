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

import android.Manifest;
import android.annotation.TargetApi;
import android.content.Context;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Bitmap.Config;
import android.graphics.BitmapFactory;
import android.os.Build.VERSION_CODES;
import android.os.Environment;
import android.os.StatFs;
import android.util.LruCache;
import android.util.Log;

import java.io.File;
import java.lang.ref.SoftReference;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

/**
 * This class handles disk and memory caching of bitmaps in conjunction with the
 * {@link Worker} class and its subclasses. Use
 * {@link Cache#getInstance(CacheParams)} to get an instance of this
 * class, although usually a cache should be added directly to an {@link Worker} by calling
 * {@link Worker#addImageCache(Cache)}.
 */
public class Cache {
    private static final String TAG = "JS";

    // Default memory cache size in kilobytes
    private static final int DEFAULT_MEM_CACHE_SIZE = 1024 * 5; // 5MB

    // Constants to easily toggle various caches
    private static final boolean DEFAULT_MEM_CACHE_ENABLED = true;
    private static final boolean DEFAULT_DISK_CACHE_ENABLED = true;

    private static Cache instance;
    private HashMap<String, Integer> mMemoryCacheUsage;
    private LruCache<String, Bitmap> mMemoryCache;
    private CacheParams mParams;

    private Set<SoftReference<Bitmap>> mReusableBitmaps;

    /**
     * Create a new Cache object using the specified parameters. This should not be
     * called directly by other classes, instead use
     * {@link Cache#getInstance(CacheParams)} to fetch an Cache
     * instance.
     */
    private Cache() {
    }

    /**
     * Return an {@link Cache} instance.
     *
     * @return An existing retained Cache object or a new one if one did not exist
     */
    public static Cache getInstance(CacheParams cacheParams) {
        if (instance == null) {
            instance = new Cache();
        }

        if (instance.mParams != cacheParams) {
            instance.init(cacheParams);
        }

        return instance;
    }

    /**
     * Initialize the cache, providing all parameters.
     *
     * @param cacheParams The cache parameters to initialize the cache
     */
    private void init(CacheParams cacheParams) {
        clearCache();
        if (mReusableBitmaps != null) {
            mReusableBitmaps.clear();
            mReusableBitmaps = null;
        }

        mParams = cacheParams;

        // Set up memory cache
        if (mParams.memoryCacheEnabled) {
            if (Worker.debuggable > 0) {
                Log.v(TAG, "Memory cache created (size = " + mParams.memCacheSize + ")");
            }

            // If we're running on Honeycomb or newer, create a set of reusable bitmaps that can be
            // populated into the inBitmap field of BitmapFactory.Options. Note that the set is
            // of SoftReferences which will actually not be very effective due to the garbage
            // collector being aggressive clearing Soft/WeakReferences. A better approach
            // would be to use a strongly references bitmaps, however this would require some
            // balancing of memory usage between this set and the bitmap LruCache. It would also
            // require knowledge of the expected size of the bitmaps. From Honeycomb to JellyBean
            // the size would need to be precise, from KitKat onward the size would just need to
            // be the upper bound (due to changes in how inBitmap can re-use bitmaps).
            if (Utils.hasHoneycomb()) {
                mReusableBitmaps =
                        Collections.synchronizedSet(new HashSet<SoftReference<Bitmap>>());
            }

            mMemoryCacheUsage = new HashMap<String, Integer>();
            mMemoryCache = new LruCache<String, Bitmap>(mParams.memCacheSize) {

                /**
                 * Notify the removed entry that is no longer being cached
                 */
                @Override
                protected void entryRemoved(boolean evicted, String key,
                                            Bitmap oldValue, Bitmap newValue) {
                    Integer count = mMemoryCacheUsage.get(key);
                    if (Utils.hasHoneycomb() && (count == null || count == 0)) {
                        // We're running on Honeycomb or later, so add the bitmap
                        // to a SoftReference set for possible use with inBitmap later
                        mReusableBitmaps.add(new SoftReference<Bitmap>(oldValue));
                    }
                }

                /**
                 * Measure item size in kilobytes rather than units which is more practical
                 * for a bitmap cache
                 */
                @Override
                protected int sizeOf(String key, Bitmap value) {
                    final int bitmapSize = getBitmapSize(value) / 1024;
                    return bitmapSize == 0 ? 1 : bitmapSize;
                }
            };
        }
    }

    /**
     * Adds a bitmap to both memory and disk cache.
     *
     * @param data  Unique identifier for the bitmap to store
     * @param value The bitmap drawable to store
     */
    public void addBitmapToCache(String data, Bitmap value) {
        if (data == null || value == null) {
            return;
        }

        // Add to memory cache
        if (mMemoryCache != null) {
            Bitmap currentValue = mMemoryCache.get(data);
            // NOTE: If we have existing we probably loaded it sync so we don't want to add the new one,
            // because this will make the previous bitmap free for reuse but it is used somewhere.
            // Probably won't happen often.
            if (currentValue == null) {
                Integer count = mMemoryCacheUsage.get(data);
                // NOTE: count should be null here.
                mMemoryCacheUsage.put(data, count == null ? 1 : count + 1);
                mMemoryCache.put(data, value);
            }
        }
    }

    /**
     * Get from memory cache.
     *
     * @param data Unique identifier for which item to get
     * @return The bitmap if found in cache, null otherwise
     */
    public Bitmap getBitmapFromMemCache(String data) {
        Bitmap memValue = null;

        if (mMemoryCache != null) {
            memValue = mMemoryCache.get(data);
            if (memValue != null) {
                Integer count = mMemoryCacheUsage.get(data);
                mMemoryCacheUsage.put(data, count == null ? 1 : count + 1);
            }
        }

        if (Worker.debuggable > 0 && memValue != null) {
            Log.v(TAG, "Memory cache hit");
        }

        return memValue;
    }

    public void reduceDisplayedCounter(String uri) {
        if (mMemoryCache != null) {
            Integer count = mMemoryCacheUsage.get(uri);
            if (count != null) {
                if (count == 1) {
                    mMemoryCacheUsage.remove(uri);
                } else {
                    mMemoryCacheUsage.put(uri, count - 1);
                }
            }
        }
    }

    /**
     * @param options - BitmapFactory.Options with out* options populated
     * @return Bitmap that case be used for inBitmap
     */
    protected Bitmap getBitmapFromReusableSet(BitmapFactory.Options options) {
        //BEGIN_INCLUDE(get_bitmap_from_reusable_set)
        Bitmap bitmap = null;

        if (mReusableBitmaps != null && !mReusableBitmaps.isEmpty()) {
            synchronized (mReusableBitmaps) {
                final Iterator<SoftReference<Bitmap>> iterator = mReusableBitmaps.iterator();
                Bitmap item;

                while (iterator.hasNext()) {
                    item = iterator.next().get();

                    if (null != item && item.isMutable()) {
                        // Check to see it the item can be used for inBitmap
                        if (canUseForInBitmap(item, options)) {
                            bitmap = item;

                            // Remove from reusable set so it can't be used again
                            iterator.remove();
                            break;
                        }
                    } else {
                        // Remove from the set if the reference has been cleared.
                        iterator.remove();
                    }
                }
            }
        }

        return bitmap;
        //END_INCLUDE(get_bitmap_from_reusable_set)
    }

    /**
     * Clears both the memory and disk cache associated with this Cache object. Note that
     * this includes disk access so this should not be executed on the main/UI thread.
     */
    public void clearCache() {
        if (mMemoryCache != null) {
            mMemoryCache.evictAll();
            if (Worker.debuggable > 0) {
                Log.v(TAG, "Memory cache cleared");
            }
        }
        if (mMemoryCacheUsage != null) {
            mMemoryCacheUsage.clear();
        }

        mMemoryCacheUsage = null;
        mMemoryCache = null;
    }

    /**
     * A holder class that contains cache parameters.
     */
    public static class CacheParams {
        public int memCacheSize = DEFAULT_MEM_CACHE_SIZE;
        public boolean memoryCacheEnabled = DEFAULT_MEM_CACHE_ENABLED;
        public boolean diskCacheEnabled = DEFAULT_DISK_CACHE_ENABLED;

        /**
         * Sets the memory cache size based on a percentage of the max available VM memory.
         * Eg. setting percent to 0.2 would set the memory cache to one fifth of the available
         * memory. Throws {@link IllegalArgumentException} if percent is < 0.01 or > .8.
         * memCacheSize is stored in kilobytes instead of bytes as this will eventually be passed
         * to construct a LruCache which takes an int in its constructor.
         * <p>
         * This value should be chosen carefully based on a number of factors
         * Refer to the corresponding Android Training class for more discussion:
         * http://developer.android.com/training/displaying-bitmaps/
         *
         * @param percent Percent of available app memory to use to size memory cache
         */
        public void setMemCacheSizePercent(float percent) {
            if (percent < 0.01f || percent > 0.8f) {
                throw new IllegalArgumentException("setMemCacheSizePercent - percent must be "
                        + "between 0.01 and 0.8 (inclusive)");
            }
            memCacheSize = Math.round(percent * Runtime.getRuntime().maxMemory() / 1024);
        }
    }

    /**
     * @param candidate     - Bitmap to check
     * @param targetOptions - Options that have the out* value populated
     * @return true if <code>candidate</code> can be used for inBitmap re-use with
     * <code>targetOptions</code>
     */
    @TargetApi(VERSION_CODES.KITKAT)
    private static boolean canUseForInBitmap(
            Bitmap candidate, BitmapFactory.Options targetOptions) {
        //BEGIN_INCLUDE(can_use_for_inbitmap)
        if (!Utils.hasKitKat()) {
            // On earlier versions, the dimensions must match exactly and the inSampleSize must be 1
            return candidate.getWidth() == targetOptions.outWidth
                    && candidate.getHeight() == targetOptions.outHeight
                    && targetOptions.inSampleSize == 1;
        }

        // From Android 4.4 (KitKat) onward we can re-use if the byte size of the new bitmap
        // is smaller than the reusable bitmap candidate allocation byte count.
        int width = targetOptions.outWidth / targetOptions.inSampleSize;
        int height = targetOptions.outHeight / targetOptions.inSampleSize;
        int byteCount = width * height * getBytesPerPixel(candidate.getConfig());
        return byteCount <= candidate.getAllocationByteCount();
        //END_INCLUDE(can_use_for_inbitmap)
    }

    /**
     * Return the byte usage per pixel of a bitmap based on its configuration.
     *
     * @param config The bitmap configuration.
     * @return The byte usage per pixel.
     */
    private static int getBytesPerPixel(Config config) {
        if (config == Config.ARGB_8888) {
            return 4;
        } else if (config == Config.RGB_565) {
            return 2;
        } else if (config == Config.ARGB_4444) {
            return 2;
        } else if (config == Config.ALPHA_8) {
            return 1;
        }
        return 1;
    }

    /**
     * Get a usable cache directory (external if available, internal otherwise).
     *
     * @param context    The context to use
     * @param uniqueName A unique directory name to append to the cache dir
     * @return The cache dir
     */
    public static File getDiskCacheDir(Context context, String uniqueName) {
        // Check if media is mounted or storage is built-in, if so, try and use external cache dir
        // otherwise use internal cache dir
        final File cacheFilePath = Environment.MEDIA_MOUNTED.equals(Environment.getExternalStorageState()) ||
                !isExternalStorageRemovable() ? getExternalCacheDir(context) : context.getCacheDir();
        // In case there is no external storage isExternalStorageRemovable returns False and we get Null from getExternalCacheDir.
        // If this is the case - fall back to internal cache dir.
        final String cachePath = cacheFilePath != null ? cacheFilePath.getPath() : context.getCacheDir().getPath();
        return new File(cachePath + File.separator + uniqueName);
    }

    /**
     * A hashing method that changes a string (like a URL) into a hash suitable for using as a
     * disk filename.
     */
    public static String hashKeyForDisk(String key) {
        String cacheKey;
        try {
            final MessageDigest mDigest = MessageDigest.getInstance("MD5");
            mDigest.update(key.getBytes());
            cacheKey = bytesToHexString(mDigest.digest());
        } catch (NoSuchAlgorithmException e) {
            cacheKey = String.valueOf(key.hashCode());
        }
        return cacheKey;
    }

    private static String bytesToHexString(byte[] bytes) {
        // http://stackoverflow.com/questions/332079
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < bytes.length; i++) {
            String hex = Integer.toHexString(0xFF & bytes[i]);
            if (hex.length() == 1) {
                sb.append('0');
            }
            sb.append(hex);
        }
        return sb.toString();
    }

    /**
     * Get the size in bytes of a bitmap in a BitmapDrawable. Note that from Android 4.4 (KitKat)
     * onward this returns the allocated memory size of the bitmap which can be larger than the
     * actual bitmap data byte count (in the case it was re-used).
     *
     * @param bitmap
     * @return size in bytes
     */
    @TargetApi(VERSION_CODES.KITKAT)
    public static int getBitmapSize(Bitmap bitmap) {
        // From KitKat onward use getAllocationByteCount() as allocated bytes can potentially be
        // larger than bitmap byte count.
        if (Utils.hasKitKat()) {
            return bitmap.getAllocationByteCount();
        }

        if (Utils.hasHoneycombMR1()) {
            return bitmap.getByteCount();
        }

        // Pre HC-MR1
        return bitmap.getRowBytes() * bitmap.getHeight();
    }

    /**
     * Check if external storage is built-in or removable.
     *
     * @return True if external storage is removable (like an SD card), false
     * otherwise.
     */
    @TargetApi(VERSION_CODES.GINGERBREAD)
    public static boolean isExternalStorageRemovable() {
        if (Utils.hasGingerbread()) {
            return Environment.isExternalStorageRemovable();
        }
        return true;
    }

    /**
     * Get the external app cache directory.
     *
     * @param context The context to use
     * @return The external cache dir
     */
    @TargetApi(VERSION_CODES.FROYO)
    public static File getExternalCacheDir(Context context) {
        if (Utils.hasFroyo()) {
            if (Utils.hasKitKat() ||
                    context.checkPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE, android.os.Process.myPid(), android.os.Process.myUid()) == PackageManager.PERMISSION_GRANTED) {
                return context.getExternalCacheDir();
            }

            return null;
        }

        // Before Froyo we need to construct the external cache dir ourselves
        final String cacheDir = "/Android/data/" + context.getPackageName() + "/cache/";
        return new File(Environment.getExternalStorageDirectory().getPath() + cacheDir);
    }

    /**
     * Check how much usable space is available at a given path.
     *
     * @param path The path to check
     * @return The space available in bytes
     */
    @TargetApi(VERSION_CODES.GINGERBREAD)
    public static long getUsableSpace(File path) {
        if (Utils.hasGingerbread()) {
            return path.getUsableSpace();
        }
        final StatFs stats = new StatFs(path.getPath());
        return (long) stats.getBlockSize() * (long) stats.getAvailableBlocks();
    }
}
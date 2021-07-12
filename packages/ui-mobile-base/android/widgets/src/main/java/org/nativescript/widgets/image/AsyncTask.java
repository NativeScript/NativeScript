/*
 * Copyright (C) 2008 The Android Open Source Project
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
import android.os.Handler;
import android.os.Message;
import android.os.Process;

import java.util.ArrayDeque;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Callable;
import java.util.concurrent.CancellationException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.FutureTask;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * *************************************
 * Copied from JB release framework:
 * https://android.googlesource.com/platform/frameworks/base/+/jb-release/core/java/android/os/AsyncTask.java
 *
 * so that threading behavior on all OS versions is the same and we can tweak behavior by using
 * executeOnExecutor() if needed.
 *
 * There are 3 changes in this copy of AsyncTask:
 *    -pre-HC a single thread executor is used for serial operation
 *    (Executors.newSingleThreadExecutor) and is the default
 *    -the default THREAD_POOL_EXECUTOR was changed to use DiscardOldestPolicy
 *    -a new fixed thread pool called DUAL_THREAD_EXECUTOR was added
 * *************************************
 *
 * <p>AsyncTask enables proper and easy use of the UI thread. This class allows to
 * perform background operations and publish results on the UI thread without
 * having to manipulate threads and/or handlers.</p>
 *
 * <p>AsyncTask is designed to be a helper class around {@link Thread} and {@link Handler}
 * and does not constitute a generic threading framework. AsyncTasks should ideally be
 * used for short operations (a few seconds at the most.) If you need to keep threads
 * running for long periods of time, it is highly recommended you use the various APIs
 * provided by the <code>java.util.concurrent</code> pacakge such as {@link Executor},
 * {@link ThreadPoolExecutor} and {@link FutureTask}.</p>
 *
 * <p>An asynchronous task is defined by a computation that runs on a background thread and
 * whose result is published on the UI thread. An asynchronous task is defined by 3 generic
 * types, called <code>Params</code>, <code>Progress</code> and <code>Result</code>,
 * and 4 steps, called <code>onPreExecute</code>, <code>doInBackground</code>,
 * <code>onProgressUpdate</code> and <code>onPostExecute</code>.</p>
 *
 * <div class="special reference">
 * <h3>Developer Guides</h3>
 * <p>For more information about using tasks and threads, read the
 * <a href="{@docRoot}guide/topics/fundamentals/processes-and-threads.html">Processes and
 * Threads</a> developer guide.</p>
 * </div>
 *
 * <h2>Usage</h2>
 * <p>AsyncTask must be subclassed to be used. The subclass will override at least
 * one method ({@link #doInBackground}), and most often will override a
 * second one ({@link #onPostExecute}.)</p>
 *
 * <p>Here is an example of subclassing:</p>
 * <pre class="prettyprint">
 * private class DownloadFilesTask extends AsyncTask&lt;URL, Integer, Long&gt; {
 *     protected Long doInBackground(URL... urls) {
 *         int count = urls.length;
 *         long totalSize = 0;
 *         for (int i = 0; i < count; i++) {
 *             totalSize += Downloader.downloadFile(urls[i]);
 *             publishProgress((int) ((i / (float) count) * 100));
 *             // Escape early if cancel() is called
 *             if (isCancelled()) break;
 *         }
 *         return totalSize;
 *     }
 *
 *     protected void onProgressUpdate(Integer... progress) {
 *         setProgressPercent(progress[0]);
 *     }
 *
 *     protected void onPostExecute(Long result) {
 *         showDialog("Downloaded " + result + " bytes");
 *     }
 * }
 * </pre>
 *
 * <p>Once created, a task is executed very simply:</p>
 * <pre class="prettyprint">
 * new DownloadFilesTask().execute(url1, url2, url3);
 * </pre>
 *
 * <h2>AsyncTask's generic types</h2>
 * <p>The three types used by an asynchronous task are the following:</p>
 * <ol>
 *     <li><code>Params</code>, the type of the parameters sent to the task upon
 *     execution.</li>
 *     <li><code>Progress</code>, the type of the progress units published during
 *     the background computation.</li>
 *     <li><code>Result</code>, the type of the result of the background
 *     computation.</li>
 * </ol>
 * <p>Not all types are always used by an asynchronous task. To mark a type as unused,
 * simply use the type {@link Void}:</p>
 * <pre>
 * private class MyTask extends AsyncTask&lt;Void, Void, Void&gt; { ... }
 * </pre>
 *
 * <h2>The 4 steps</h2>
 * <p>When an asynchronous task is executed, the task goes through 4 steps:</p>
 * <ol>
 *     <li>{@link #onPreExecute()}, invoked on the UI thread immediately after the task
 *     is executed. This step is normally used to setup the task, for instance by
 *     showing a progress bar in the user interface.</li>
 *     <li>{@link #doInBackground}, invoked on the background thread
 *     immediately after {@link #onPreExecute()} finishes executing. This step is used
 *     to perform background computation that can take a long time. The parameters
 *     of the asynchronous task are passed to this step. The result of the computation must
 *     be returned by this step and will be passed back to the last step. This step
 *     can also use {@link #publishProgress} to publish one or more units
 *     of progress. These values are published on the UI thread, in the
 *     {@link #onProgressUpdate} step.</li>
 *     <li>{@link #onProgressUpdate}, invoked on the UI thread after a
 *     call to {@link #publishProgress}. The timing of the execution is
 *     undefined. This method is used to display any form of progress in the user
 *     interface while the background computation is still executing. For instance,
 *     it can be used to animate a progress bar or show logs in a text field.</li>
 *     <li>{@link #onPostExecute}, invoked on the UI thread after the background
 *     computation finishes. The result of the background computation is passed to
 *     this step as a parameter.</li>
 * </ol>
 *
 * <h2>Cancelling a task</h2>
 * <p>A task can be cancelled at any time by invoking {@link #cancel(boolean)}. Invoking
 * this method will cause subsequent calls to {@link #isCancelled()} to return true.
 * After invoking this method, {@link #onCancelled(Object)}, instead of
 * {@link #onPostExecute(Object)} will be invoked after {@link #doInBackground(Object[])}
 * returns. To ensure that a task is cancelled as quickly as possible, you should always
 * check the return value of {@link #isCancelled()} periodically from
 * {@link #doInBackground(Object[])}, if possible (inside a loop for instance.)</p>
 *
 * <h2>Threading rules</h2>
 * <p>There are a few threading rules that must be followed for this class to
 * work properly:</p>
 * <ul>
 *     <li>The AsyncTask class must be loaded on the UI thread. This is done
 *     automatically as of {@link android.os.Build.VERSION_CODES#JELLY_BEAN}.</li>
 *     <li>The task instance must be created on the UI thread.</li>
 *     <li>{@link #execute} must be invoked on the UI thread.</li>
 *     <li>Do not call {@link #onPreExecute()}, {@link #onPostExecute},
 *     {@link #doInBackground}, {@link #onProgressUpdate} manually.</li>
 *     <li>The task can be executed only once (an exception will be thrown if
 *     a second execution is attempted.)</li>
 * </ul>
 *
 * <h2>Memory observability</h2>
 * <p>AsyncTask guarantees that all callback calls are synchronized in such a way that the following
 * operations are safe without explicit synchronizations.</p>
 * <ul>
 *     <li>Set member fields in the constructor or {@link #onPreExecute}, and refer to them
 *     in {@link #doInBackground}.
 *     <li>Set member fields in {@link #doInBackground}, and refer to them in
 *     {@link #onProgressUpdate} and {@link #onPostExecute}.
 * </ul>
 *
 * <h2>Order of execution</h2>
 * <p>When first introduced, AsyncTasks were executed serially on a single background
 * thread. Starting with {@link android.os.Build.VERSION_CODES#DONUT}, this was changed
 * to a pool of threads allowing multiple tasks to operate in parallel. Starting with
 * {@link android.os.Build.VERSION_CODES#HONEYCOMB}, tasks are executed on a single
 * thread to avoid common application errors caused by parallel execution.</p>
 * <p>If you truly want parallel execution, you can invoke
 * {@link #executeOnExecutor(Executor, Object[])} with
 * {@link #THREAD_POOL_EXECUTOR}.</p>
 */
public abstract class AsyncTask<Params, Progress, Result> {
    private static final String LOG_TAG = "AsyncTask";

    private static final int CORE_POOL_SIZE = 5;
    private static final int MAXIMUM_POOL_SIZE = 128;
    private static final int KEEP_ALIVE = 1;

    private static final ThreadFactory  sThreadFactory = new ThreadFactory() {
        private final AtomicInteger mCount = new AtomicInteger(1);

        public Thread newThread(Runnable r) {
            return new Thread(r, "AsyncTask #" + mCount.getAndIncrement());
        }
    };

    private static final BlockingQueue<Runnable> sPoolWorkQueue =
            new LinkedBlockingQueue<Runnable>(10);

    /**
     * An {@link Executor} that can be used to execute tasks in parallel.
     */
    public static final Executor THREAD_POOL_EXECUTOR
            = new ThreadPoolExecutor(CORE_POOL_SIZE, MAXIMUM_POOL_SIZE, KEEP_ALIVE,
            TimeUnit.SECONDS, sPoolWorkQueue, sThreadFactory,
            new ThreadPoolExecutor.DiscardOldestPolicy());

    /**
     * An {@link Executor} that executes tasks one at a time in serial
     * order.  This serialization is global to a particular process.
     */
    public static final Executor SERIAL_EXECUTOR = Utils.hasHoneycomb() ? new SerialExecutor() :
            Executors.newSingleThreadExecutor(sThreadFactory);

    public static final Executor DUAL_THREAD_EXECUTOR =
            Executors.newFixedThreadPool(2, sThreadFactory);

    private static final int MESSAGE_POST_RESULT = 0x1;
    private static final int MESSAGE_POST_PROGRESS = 0x2;

    private static final InternalHandler sHandler = new InternalHandler();

    private static volatile Executor sDefaultExecutor = SERIAL_EXECUTOR;
    private final WorkerRunnable<Params, Result> mWorker;
    private final FutureTask<Result> mFuture;

    private volatile Status mStatus = Status.PENDING;

    private final AtomicBoolean mCancelled = new AtomicBoolean();
    private final AtomicBoolean mTaskInvoked = new AtomicBoolean();

    @TargetApi(11)
    private static class SerialExecutor implements Executor {
        final ArrayDeque<Runnable> mTasks = new ArrayDeque<Runnable>();
        Runnable mActive;

        public synchronized void execute(final Runnable r) {
            mTasks.offer(new Runnable() {
                public void run() {
                    try {
                        r.run();
                    } finally {
                        scheduleNext();
                    }
                }
            });
            if (mActive == null) {
                scheduleNext();
            }
        }

        protected synchronized void scheduleNext() {
            if ((mActive = mTasks.poll()) != null) {
                THREAD_POOL_EXECUTOR.execute(mActive);
            }
        }
    }

    /**
     * Indicates the current status of the task. Each status will be set only once
     * during the lifetime of a task.
     */
    public enum Status {
        /**
         * Indicates that the task has not been executed yet.
         */
        PENDING,
        /**
         * Indicates that the task is running.
         */
        RUNNING,
        /**
         * Indicates that {@link AsyncTask#onPostExecute} has finished.
         */
        FINISHED,
    }

    /** @hide Used to force static handler to be created. */
    public static void init() {
        sHandler.getLooper();
    }

    /** @hide */
    public static void setDefaultExecutor(Executor exec) {
        sDefaultExecutor = exec;
    }

    /**
     * Creates a new asynchronous task. This constructor must be invoked on the UI thread.
     */
    public AsyncTask() {
        mWorker = new WorkerRunnable<Params, Result>() {
            public Result call() throws Exception {
                mTaskInvoked.set(true);

                Process.setThreadPriority(Process.THREAD_PRIORITY_BACKGROUND);
                //noinspection unchecked
                return postResult(doInBackground(mParams));
            }
        };

        mFuture = new FutureTask<Result>(mWorker) {
            @Override
            protected void done() {
                try {
                    postResultIfNotInvoked(get());
                } catch (InterruptedException e) {
                    android.util.Log.w(LOG_TAG, e);
                } catch (ExecutionException e) {
                    throw new RuntimeException("An error occured while executing doInBackground()",
                            e.getCause());
                } catch (CancellationException e) {
                    postResultIfNotInvoked(null);
                }
            }
        };
    }

    private void postResultIfNotInvoked(Result result) {
        final boolean wasTaskInvoked = mTaskInvoked.get();
        if (!wasTaskInvoked) {
            postResult(result);
        }
    }

    private Result postResult(Result result) {
        @SuppressWarnings("unchecked")
        Message message = sHandler.obtainMessage(MESSAGE_POST_RESULT,
                new AsyncTaskResult<Result>(this, result));
        message.sendToTarget();
        return result;
    }

    /**
     * Returns the current status of this task.
     *
     * @return The current status.
     */
    public final Status getStatus() {
        return mStatus;
    }

    /**
     * Override this method to perform a computation on a background thread. The
     * specified parameters are the parameters passed to {@link #execute}
     * by the caller of this task.
     *
     * This method can call {@link #publishProgress} to publish updates
     * on the UI thread.
     *
     * @param params The parameters of the task.
     *
     * @return A result, defined by the subclass of this task.
     *
     * @see #onPreExecute()
     * @see #onPostExecute
     * @see #publishProgress
     */
    protected abstract Result doInBackground(Params... params);

    /**
     * Runs on the UI thread before {@link #doInBackground}.
     *
     * @see #onPostExecute
     * @see #doInBackground
     */
    protected void onPreExecute() {
    }

    /**
     * <p>Runs on the UI thread after {@link #doInBackground}. The
     * specified result is the value returned by {@link #doInBackground}.</p>
     *
     * <p>This method won't be invoked if the task was cancelled.</p>
     *
     * @param result The result of the operation computed by {@link #doInBackground}.
     *
     * @see #onPreExecute
     * @see #doInBackground
     * @see #onCancelled(Object)
     */
    @SuppressWarnings({"UnusedDeclaration"})
    protected void onPostExecute(Result result) {
    }

    /**
     * Runs on the UI thread after {@link #publishProgress} is invoked.
     * The specified values are the values passed to {@link #publishProgress}.
     *
     * @param values The values indicating progress.
     *
     * @see #publishProgress
     * @see #doInBackground
     */
    @SuppressWarnings({"UnusedDeclaration"})
    protected void onProgressUpdate(Progress... values) {
    }

    /**
     * <p>Runs on the UI thread after {@link #cancel(boolean)} is invoked and
     * {@link #doInBackground(Object[])} has finished.</p>
     *
     * <p>The default implementation simply invokes {@link #onCancelled()} and
     * ignores the result. If you write your own implementation, do not call
     * <code>super.onCancelled(result)</code>.</p>
     *
     * @param result The result, if any, computed in
     *               {@link #doInBackground(Object[])}, can be null
     *
     * @see #cancel(boolean)
     * @see #isCancelled()
     */
    @SuppressWarnings({"UnusedParameters"})
    protected void onCancelled(Result result) {
        onCancelled();
    }

    /**
     * <p>Applications should preferably override {@link #onCancelled(Object)}.
     * This method is invoked by the default implementation of
     * {@link #onCancelled(Object)}.</p>
     *
     * <p>Runs on the UI thread after {@link #cancel(boolean)} is invoked and
     * {@link #doInBackground(Object[])} has finished.</p>
     *
     * @see #onCancelled(Object)
     * @see #cancel(boolean)
     * @see #isCancelled()
     */
    protected void onCancelled() {
    }

    /**
     * Returns <tt>true</tt> if this task was cancelled before it completed
     * normally. If you are calling {@link #cancel(boolean)} on the task,
     * the value returned by this method should be checked periodically from
     * {@link #doInBackground(Object[])} to end the task as soon as possible.
     *
     * @return <tt>true</tt> if task was cancelled before it completed
     *
     * @see #cancel(boolean)
     */
    public final boolean isCancelled() {
        return mCancelled.get();
    }

    /**
     * <p>Attempts to cancel execution of this task.  This attempt will
     * fail if the task has already completed, already been cancelled,
     * or could not be cancelled for some other reason. If successful,
     * and this task has not started when <tt>cancel</tt> is called,
     * this task should never run. If the task has already started,
     * then the <tt>mayInterruptIfRunning</tt> parameter determines
     * whether the thread executing this task should be interrupted in
     * an attempt to stop the task.</p>
     *
     * <p>Calling this method will result in {@link #onCancelled(Object)} being
     * invoked on the UI thread after {@link #doInBackground(Object[])}
     * returns. Calling this method guarantees that {@link #onPostExecute(Object)}
     * is never invoked. After invoking this method, you should check the
     * value returned by {@link #isCancelled()} periodically from
     * {@link #doInBackground(Object[])} to finish the task as early as
     * possible.</p>
     *
     * @param mayInterruptIfRunning <tt>true</tt> if the thread executing this
     *        task should be interrupted; otherwise, in-progress tasks are allowed
     *        to complete.
     *
     * @return <tt>false</tt> if the task could not be cancelled,
     *         typically because it has already completed normally;
     *         <tt>true</tt> otherwise
     *
     * @see #isCancelled()
     * @see #onCancelled(Object)
     */
    public final boolean cancel(boolean mayInterruptIfRunning) {
        mCancelled.set(true);
        return mFuture.cancel(mayInterruptIfRunning);
    }

    /**
     * Waits if necessary for the computation to complete, and then
     * retrieves its result.
     *
     * @return The computed result.
     *
     * @throws CancellationException If the computation was cancelled.
     * @throws ExecutionException If the computation threw an exception.
     * @throws InterruptedException If the current thread was interrupted
     *         while waiting.
     */
    public final Result get() throws InterruptedException, ExecutionException {
        return mFuture.get();
    }

    /**
     * Waits if necessary for at most the given time for the computation
     * to complete, and then retrieves its result.
     *
     * @param timeout Time to wait before cancelling the operation.
     * @param unit The time unit for the timeout.
     *
     * @return The computed result.
     *
     * @throws CancellationException If the computation was cancelled.
     * @throws ExecutionException If the computation threw an exception.
     * @throws InterruptedException If the current thread was interrupted
     *         while waiting.
     * @throws TimeoutException If the wait timed out.
     */
    public final Result get(long timeout, TimeUnit unit) throws InterruptedException,
            ExecutionException, TimeoutException {
        return mFuture.get(timeout, unit);
    }

    /**
     * Executes the task with the specified parameters. The task returns
     * itself (this) so that the caller can keep a reference to it.
     *
     * <p>Note: this function schedules the task on a queue for a single background
     * thread or pool of threads depending on the platform version.  When first
     * introduced, AsyncTasks were executed serially on a single background thread.
     * Starting with {@link android.os.Build.VERSION_CODES#DONUT}, this was changed
     * to a pool of threads allowing multiple tasks to operate in parallel. Starting
     * {@link android.os.Build.VERSION_CODES#HONEYCOMB}, tasks are back to being
     * executed on a single thread to avoid common application errors caused
     * by parallel execution.  If you truly want parallel execution, you can use
     * the {@link #executeOnExecutor} version of this method
     * with {@link #THREAD_POOL_EXECUTOR}; however, see commentary there for warnings
     * on its use.
     *
     * <p>This method must be invoked on the UI thread.
     *
     * @param params The parameters of the task.
     *
     * @return This instance of AsyncTask.
     *
     * @throws IllegalStateException If {@link #getStatus()} returns either
     *         {@link AsyncTask.Status#RUNNING} or {@link AsyncTask.Status#FINISHED}.
     *
     * @see #executeOnExecutor(Executor, Object[])
     * @see #execute(Runnable)
     */
    public final AsyncTask<Params, Progress, Result> execute(Params... params) {
        return executeOnExecutor(sDefaultExecutor, params);
    }

    /**
     * Executes the task with the specified parameters. The task returns
     * itself (this) so that the caller can keep a reference to it.
     *
     * <p>This method is typically used with {@link #THREAD_POOL_EXECUTOR} to
     * allow multiple tasks to run in parallel on a pool of threads managed by
     * AsyncTask, however you can also use your own {@link Executor} for custom
     * behavior.
     *
     * <p><em>Warning:</em> Allowing multiple tasks to run in parallel from
     * a thread pool is generally <em>not</em> what one wants, because the order
     * of their operation is not defined.  For example, if these tasks are used
     * to modify any state in common (such as writing a file due to a button click),
     * there are no guarantees on the order of the modifications.
     * Without careful work it is possible in rare cases for the newer version
     * of the data to be over-written by an older one, leading to obscure data
     * loss and stability issues.  Such changes are best
     * executed in serial; to guarantee such work is serialized regardless of
     * platform version you can use this function with {@link #SERIAL_EXECUTOR}.
     *
     * <p>This method must be invoked on the UI thread.
     *
     * @param exec The executor to use.  {@link #THREAD_POOL_EXECUTOR} is available as a
     *              convenient process-wide thread pool for tasks that are loosely coupled.
     * @param params The parameters of the task.
     *
     * @return This instance of AsyncTask.
     *
     * @throws IllegalStateException If {@link #getStatus()} returns either
     *         {@link AsyncTask.Status#RUNNING} or {@link AsyncTask.Status#FINISHED}.
     *
     * @see #execute(Object[])
     */
    public final AsyncTask<Params, Progress, Result> executeOnExecutor(Executor exec,
                                                                       Params... params) {
        if (mStatus != Status.PENDING) {
            switch (mStatus) {
                case RUNNING:
                    throw new IllegalStateException("Cannot execute task:"
                            + " the task is already running.");
                case FINISHED:
                    throw new IllegalStateException("Cannot execute task:"
                            + " the task has already been executed "
                            + "(a task can be executed only once)");
            }
        }

        mStatus = Status.RUNNING;

        onPreExecute();

        mWorker.mParams = params;
        exec.execute(mFuture);

        return this;
    }

    /**
     * Convenience version of {@link #execute(Object...)} for use with
     * a simple Runnable object. See {@link #execute(Object[])} for more
     * information on the order of execution.
     *
     * @see #execute(Object[])
     * @see #executeOnExecutor(Executor, Object[])
     */
    public static void execute(Runnable runnable) {
        sDefaultExecutor.execute(runnable);
    }

    /**
     * This method can be invoked from {@link #doInBackground} to
     * publish updates on the UI thread while the background computation is
     * still running. Each call to this method will trigger the execution of
     * {@link #onProgressUpdate} on the UI thread.
     *
     * {@link #onProgressUpdate} will note be called if the task has been
     * canceled.
     *
     * @param values The progress values to update the UI with.
     *
     * @see #onProgressUpdate
     * @see #doInBackground
     */
    protected final void publishProgress(Progress... values) {
        if (!isCancelled()) {
            sHandler.obtainMessage(MESSAGE_POST_PROGRESS,
                    new AsyncTaskResult<Progress>(this, values)).sendToTarget();
        }
    }

    private void finish(Result result) {
        if (isCancelled()) {
            onCancelled(result);
        } else {
            onPostExecute(result);
        }
        mStatus = Status.FINISHED;
    }

    private static class InternalHandler extends Handler {
        @SuppressWarnings({"unchecked", "RawUseOfParameterizedType"})
        @Override
        public void handleMessage(Message msg) {
            AsyncTaskResult result = (AsyncTaskResult) msg.obj;
            switch (msg.what) {
                case MESSAGE_POST_RESULT:
                    // There is only one result
                    result.mTask.finish(result.mData[0]);
                    break;
                case MESSAGE_POST_PROGRESS:
                    result.mTask.onProgressUpdate(result.mData);
                    break;
            }
        }
    }

    private static abstract class WorkerRunnable<Params, Result> implements Callable<Result> {
        Params[] mParams;
    }

    @SuppressWarnings({"RawUseOfParameterizedType"})
    private static class AsyncTaskResult<Data> {
        final AsyncTask mTask;
        final Data[] mData;

        AsyncTaskResult(AsyncTask task, Data... data) {
            mTask = task;
            mData = data;
        }
    }
}
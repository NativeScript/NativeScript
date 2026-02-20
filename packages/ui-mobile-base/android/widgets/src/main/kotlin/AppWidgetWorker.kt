package org.nativescript.widgets

import android.content.Context
import android.os.SystemClock
import androidx.work.Data
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequest
import androidx.work.PeriodicWorkRequest
import androidx.work.WorkInfo
import androidx.work.WorkManager
import androidx.work.Worker
import androidx.work.WorkerParameters
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.TimeUnit

abstract class AppWidgetWorker(
	context: Context,
	params: WorkerParameters
) : Worker(context, params) {

	val widgetIds: IntArray
		get() = inputData.getIntArray(KEY_WIDGET_IDS) ?: intArrayOf()

	val provider: String
		get() = inputData.getString(KEY_PROVIDER) ?: ""

	companion object {
		const val KEY_WIDGET_IDS = "widget_ids"
		const val KEY_PROVIDER = "provider"

		private val lastEnqueuedAt = ConcurrentHashMap<String, Long>()
		private const val MIN_INTERVAL_MS = 3000L

		@JvmStatic
		fun buildData(provider: String, widgetIds: IntArray): Data {
			return Data.Builder()
				.putString(KEY_PROVIDER, provider)
				.putIntArray(KEY_WIDGET_IDS, widgetIds)
				.build()
		}

		@JvmStatic
		fun <T : AppWidgetWorker> enqueue(
			context: Context,
			workerClass: Class<T>,
			provider: String,
			widgetIds: IntArray
		) {
			val workName = "widget_update_${provider}_once"
			val now = SystemClock.elapsedRealtime()
			val last = lastEnqueuedAt[workName]
			if (last != null && now - last < MIN_INTERVAL_MS) return
			lastEnqueuedAt[workName] = now

			val request = OneTimeWorkRequest.Builder(workerClass)
				.setInputData(buildData(provider, widgetIds))
				.build()
			WorkManager.getInstance(context)
				.enqueueUniqueWork(
					workName,
					ExistingWorkPolicy.REPLACE,
					request
				)
		}

		inline fun <reified T : AppWidgetWorker> enqueue(
			context: Context,
			provider: String,
			widgetIds: IntArray
		) = enqueue(context, T::class.java, provider, widgetIds)

		@JvmStatic
		@JvmOverloads
		fun <T : AppWidgetWorker> enqueuePeriodic(
			context: Context,
			workerClass: Class<T>,
			provider: String,
			widgetIds: IntArray,
			repeatIntervalMilliSeconds: Long = 900000, // 15 mins min time allowed
			uniqueWorkName: String = "widget_update_$provider"
		) {
			val request = PeriodicWorkRequest.Builder(
				workerClass,
				repeatIntervalMilliSeconds, TimeUnit.MILLISECONDS
			)
				.setInputData(buildData(provider, widgetIds))
				.build()
			WorkManager.getInstance(context)
				.enqueueUniquePeriodicWork(
					uniqueWorkName,
					ExistingPeriodicWorkPolicy.UPDATE,
					request
				)
		}

		inline fun <reified T : AppWidgetWorker> enqueuePeriodic(
			context: Context,
			provider: String,
			widgetIds: IntArray,
			repeatIntervalMilliSeconds: Long = 900000,
			uniqueWorkName: String = "widget_update_$provider"
		) = enqueuePeriodic(
			context,
			T::class.java,
			provider,
			widgetIds,
			repeatIntervalMilliSeconds,
			uniqueWorkName
		)

		@JvmStatic
		@JvmOverloads
		fun cancelPeriodic(
			context: Context,
			provider: String,
			uniqueWorkName: String = "widget_update_$provider"
		) {
			WorkManager.getInstance(context).cancelUniqueWork(uniqueWorkName)
		}


		@JvmStatic
		inline fun <reified T : AppWidgetWorker> enqueueImmediate(
			context: Context,
			provider: String,
			widgetIds: IntArray,
		) {
			val request = OneTimeWorkRequest.Builder(T::class.java)
				.setInputData(buildData(provider, widgetIds))
				.build()
			WorkManager.getInstance(context).enqueueUniqueWork(
				"widget_${provider}_immediate",
				ExistingWorkPolicy.KEEP,
				request
			)
		}

		@JvmStatic
		fun isScheduled(context: Context, provider: String): Boolean {
			val statuses = WorkManager.getInstance(context)
				.getWorkInfosForUniqueWork("widget_update_$provider")
				.get()
			return statuses.any { it.state == WorkInfo.State.ENQUEUED || it.state == WorkInfo.State.RUNNING }
		}
	}

	fun updateWidgets(rv: android.widget.RemoteViews?) {
		rv ?: return
		val mgr = android.appwidget.AppWidgetManager.getInstance(applicationContext)
		for (id in widgetIds) {
			mgr.updateAppWidget(id, rv)
		}
	}

	fun updateWidget(widgetId: Int, rv: android.widget.RemoteViews?) {
		rv ?: return
		val mgr = android.appwidget.AppWidgetManager.getInstance(applicationContext)
		mgr.updateAppWidget(widgetId, rv)
	}
}

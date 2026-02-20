package org.nativescript.widgets

import android.content.ComponentName
import android.content.Context
import android.os.Bundle
import androidx.work.WorkerParameters

open class AppWidgetProvider : android.appwidget.AppWidgetProvider() {
	private val providerName = this::class.java.name
	open val interval = 900000L

	internal class WidgetWorker(
		context: Context,
		params: WorkerParameters
	) : AppWidgetWorker(context, params) {
		override fun doWork(): Result {
			val appWidgetManager = android.appwidget.AppWidgetManager.getInstance(applicationContext)
			val component = ComponentName(
				applicationContext, this.provider
			)
			val ids = appWidgetManager.getAppWidgetIds(component)
			if (ids.isEmpty()) {
				cancelPeriodic(
					applicationContext,
					this.provider
				)
				return Result.success()
			}

			val manager = AppWidgetManager.getManager(this.provider)
			AppWidgetManager.notifyUpdateAsync(
				applicationContext,
				this.provider,
				ids,
				manager,
				appWidgetManager
			)

			return Result.success()
		}
	}

	override fun onEnabled(context: Context) {
		super.onEnabled(context)
		AppWidgetManager.notifyEnabled(providerName)
		AppWidgetWorker.enqueuePeriodic<WidgetWorker>(context, providerName, intArrayOf(), interval)
	}

	override fun onUpdate(
		context: Context?,
		appWidgetManager: android.appwidget.AppWidgetManager?,
		appWidgetIds: IntArray?
	) {
		val context = context ?: return
		val ids = appWidgetIds ?: return
		val manager = AppWidgetManager.getManager(providerName)
		AppWidgetManager.notifyUpdate(
			context,
			providerName,
			ids,
			manager,
			appWidgetManager
		)
		AppWidgetWorker.enqueueImmediate<WidgetWorker>(
			context, providerName, ids
		)
	}

	override fun onDeleted(context: Context?, appWidgetIds: IntArray?) {
		super.onDeleted(context, appWidgetIds)
		appWidgetIds?.let {
			AppWidgetManager.notifyDeleted(providerName, it)
		}
	}

	override fun onDisabled(context: Context) {
		super.onDisabled(context)
		AppWidgetManager.notifyDisabled(providerName)
		AppWidgetWorker.cancelPeriodic(
			context, providerName
		)
	}


	override fun onAppWidgetOptionsChanged(
		context: Context?,
		appWidgetManager: android.appwidget.AppWidgetManager?,
		appWidgetId: Int,
		newOptions: Bundle?
	) {
		super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions)
		val ctx = context ?: return
		newOptions?.let {
			val manager = AppWidgetManager.getManager(providerName)
			AppWidgetManager.notifyOptionsChanged(
				ctx,
				providerName,
				appWidgetId,
				it,
				manager,
				appWidgetManager
			)
		}
	}
}

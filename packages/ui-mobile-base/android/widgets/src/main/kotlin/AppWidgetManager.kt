package org.nativescript.widgets

import android.content.Context
import android.os.Bundle
import java.util.concurrent.ConcurrentHashMap

object AppWidgetManager {

	interface WidgetListener {
		fun onEnabled(provider: String) {}

		fun onUpdate(
			context: Context,
			provider: String,
			appWidgetIds: IntArray,
			manager: RemoteViewsManager,
			widgetManager: android.appwidget.AppWidgetManager?
		) {
		}


		fun onUpdateAsync(
			context: Context,
			provider: String,
			appWidgetIds: IntArray,
			manager: RemoteViewsManager,
			widgetManager: android.appwidget.AppWidgetManager?
		) {
		}

		fun onDisabled(provider: String) {}
		fun onDeleted(provider: String, appWidgetIds: IntArray) {}
		fun onOptionsChanged(
			context: Context,
			provider: String,
			appWidgetId: Int,
			newOptions: Bundle,
			manager: RemoteViewsManager,
			widgetManager: android.appwidget.AppWidgetManager?
		) {
		}
	}

	private val listeners = ConcurrentHashMap<String, WidgetListener>()
	private val managers = ConcurrentHashMap<String, RemoteViewsManager>()

	fun register(providerClass: String, listener: WidgetListener) {
		listeners[providerClass] = listener
	}

	fun unregister(providerClass: String) {
		listeners.remove(providerClass)
		managers.remove(providerClass)
	}

	fun getManager(providerClass: String): RemoteViewsManager {
		return managers.getOrPut(providerClass) { RemoteViewsManager() }
	}

	internal fun notifyUpdate(
		context: Context,
		provider: String,
		appWidgetIds: IntArray,
		manager: RemoteViewsManager,
		widgetManager: android.appwidget.AppWidgetManager?
	) {
		listeners[provider]?.onUpdate(context, provider, appWidgetIds, manager, widgetManager)
	}

	internal fun notifyUpdateAsync(
		context: Context,
		provider: String,
		appWidgetIds: IntArray,
		manager: RemoteViewsManager,
		widgetManager: android.appwidget.AppWidgetManager?
	) {
		listeners[provider]?.onUpdateAsync(context, provider, appWidgetIds, manager, widgetManager)
	}

	internal fun notifyEnabled(provider: String) {
		listeners[provider]?.onEnabled(provider)
	}

	internal fun notifyDisabled(provider: String) {
		listeners[provider]?.onDisabled(provider)
	}

	internal fun notifyDeleted(provider: String, appWidgetIds: IntArray) {
		listeners[provider]?.onDeleted(provider, appWidgetIds)
	}

	internal fun notifyOptionsChanged(
		context: Context,
		provider: String,
		appWidgetId: Int,
		newOptions: Bundle,
		manager: RemoteViewsManager,
		widgetManager: android.appwidget.AppWidgetManager?,
	) {
		listeners[provider]?.onOptionsChanged(
			context,
			provider,
			appWidgetId,
			newOptions,
			manager,
			widgetManager
		)
	}
}

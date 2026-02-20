package org.nativescript.widgets

import android.annotation.SuppressLint
import android.app.PendingIntent
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Build
import java.net.URL
import java.util.concurrent.atomic.AtomicLong

open class RemoteViews(val layout: Layout, val id: String = generateId()) {

	companion object {
		private val counter = AtomicLong(0)
		fun generateId(): String = "ns_rv_${counter.incrementAndGet()}"
	}

	internal val commands = mutableMapOf<String, Command>()
	internal var stableId: Int? = null
	internal var manager: RemoteViewsManager? = null

	sealed class Command {
		abstract fun applyTo(rv: android.widget.RemoteViews, targetId: Int)

		open fun applyToWithContext(rv: android.widget.RemoteViews, targetId: Int, context: Context) {}

		data class SetText(val value: String) : Command() {
			override fun applyTo(rv: android.widget.RemoteViews, targetId: Int) {
				rv.setTextViewText(targetId, value)
			}
		}

		data class SetTextColor(val value: Int) : Command() {
			override fun applyTo(rv: android.widget.RemoteViews, targetId: Int) {
				rv.setTextColor(targetId, value)
			}
		}

		data class SetImageResource(val resId: Int) : Command() {
			override fun applyTo(rv: android.widget.RemoteViews, targetId: Int) {
				rv.setImageViewResource(targetId, resId)
			}
		}

		data class SetVisibility(val visibility: Int) : Command() {
			override fun applyTo(rv: android.widget.RemoteViews, targetId: Int) {
				rv.setViewVisibility(targetId, visibility)
			}
		}

		data class SetByte(val method: String, val value: Byte) : Command() {
			override fun applyTo(rv: android.widget.RemoteViews, targetId: Int) {
				rv.setByte(targetId, method, value)
			}
		}

		data class SetShort(val method: String, val value: Short) : Command() {
			override fun applyTo(rv: android.widget.RemoteViews, targetId: Int) {
				rv.setShort(targetId, method, value)
			}
		}

		data class SetInt(val method: String, val value: Int) : Command() {
			override fun applyTo(rv: android.widget.RemoteViews, targetId: Int) {
				rv.setInt(targetId, method, value)
			}
		}

		data class SetLong(val method: String, val value: Long) : Command() {
			override fun applyTo(rv: android.widget.RemoteViews, targetId: Int) {
				rv.setLong(targetId, method, value)
			}
		}

		data class SetFloat(val method: String, val value: Float) : Command() {
			override fun applyTo(rv: android.widget.RemoteViews, targetId: Int) {
				rv.setFloat(targetId, method, value)
			}
		}

		data class SetBoolean(val method: String, val value: Boolean) : Command() {
			override fun applyTo(rv: android.widget.RemoteViews, targetId: Int) {
				rv.setBoolean(targetId, method, value)
			}
		}

		data class SetString(val method: String, val value: String) : Command() {
			override fun applyTo(rv: android.widget.RemoteViews, targetId: Int) {
				rv.setString(targetId, method, value)
			}
		}

		data class SetBackgroundColor(val value: Int) : Command() {
			override fun applyTo(rv: android.widget.RemoteViews, targetId: Int) {
				rv.setInt(targetId, "setBackgroundColor", value)
			}
		}


		data class SetImageURI(val value: Uri?) : Command() {
			override fun applyTo(rv: android.widget.RemoteViews, targetId: Int) {
				rv.setImageViewUri(targetId, value)
			}
		}

		data class SetImageBitmap(val value: Bitmap) : Command() {
			override fun applyTo(rv: android.widget.RemoteViews, targetId: Int) {
				rv.setImageViewBitmap(targetId, value)
			}
		}

		data class SetImageUrl(val url: String) : Command() {
			override fun applyTo(rv: android.widget.RemoteViews, targetId: Int) {
				// no-op: must be resolved via resolveRemoteResources() before build
			}

			fun resolve(): SetImageBitmap? {
				return try {
					val bitmap = URL(url).openStream().use { BitmapFactory.decodeStream(it) }
					bitmap?.let { SetImageBitmap(it) }
				} catch (e: Exception) {
					null
				}
			}
		}

		data class SetOnClickPendingIntent(val intent: PendingIntent) : Command() {
			override fun applyTo(rv: android.widget.RemoteViews, targetId: Int) {
				rv.setOnClickPendingIntent(
					targetId, intent
				)
			}

			override fun applyToWithContext(
				rv: android.widget.RemoteViews,
				targetId: Int,
				context: Context
			) {
			}
		}

		data class SetWidth(val value: Float, val unit: Int) : Command() {
			override fun applyTo(rv: android.widget.RemoteViews, targetId: Int) {
				if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
					rv.setViewLayoutWidth(targetId, value, unit)
				}
			}
		}

		data class SetHeight(val value: Float, val unit: Int) : Command() {
			override fun applyTo(rv: android.widget.RemoteViews, targetId: Int) {
				if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
					rv.setViewLayoutHeight(targetId, value, unit)
				}
			}
		}

		data class SetSize(
			val width: Float,
			val widthUnit: Int,
			val height: Float,
			val heightUnit: Int
		) : Command() {
			override fun applyTo(rv: android.widget.RemoteViews, targetId: Int) {
				if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
					rv.setViewLayoutWidth(targetId, width, widthUnit)
					rv.setViewLayoutHeight(targetId, height, heightUnit)
				}
			}
		}

		data class SetWidthDimen(val value: Float, val resource: String, val packageName: String?) :
			Command() {
			override fun applyTo(rv: android.widget.RemoteViews, targetId: Int) {}

			@SuppressLint("DiscouragedApi")
			override fun applyToWithContext(
				rv: android.widget.RemoteViews,
				targetId: Int,
				context: Context
			) {
				val res = context.resources.getIdentifier(
					resource, "dimen", packageName ?: context.packageName
				)
				if (res > 0) {
					if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
						rv.setViewLayoutWidthDimen(
							targetId,
							res
						)
					}
				}
			}
		}

		data class SetHeightDimen(val value: Float, val resource: String, val packageName: String?) :
			Command() {
			override fun applyTo(rv: android.widget.RemoteViews, targetId: Int) {}

			@SuppressLint("DiscouragedApi")
			override fun applyToWithContext(
				rv: android.widget.RemoteViews,
				targetId: Int,
				context: Context
			) {
				val res = context.resources.getIdentifier(
					resource, "dimen", packageName ?: context.packageName
				)
				if (res > 0) {
					if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
						rv.setViewLayoutHeightDimen(
							targetId,
							res
						)
					}
				}
			}
		}

		data class SetSizeDimen(
			val width: Float,
			val widthResource: String,
			val widthPackageName: String?,
			val height: Float,
			val heightResource: String,
			val heightPackageName: String?
		) : Command() {
			override fun applyTo(rv: android.widget.RemoteViews, targetId: Int) {}

			@SuppressLint("DiscouragedApi")
			override fun applyToWithContext(
				rv: android.widget.RemoteViews,
				targetId: Int,
				context: Context
			) {
				val widthRes = context.resources.getIdentifier(
					widthResource, "dimen", widthPackageName ?: context.packageName
				)
				if (widthRes > 0) {
					if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
						rv.setViewLayoutWidthDimen(
							targetId,
							widthRes
						)
					}
				}


				val heightRes = context.resources.getIdentifier(
					heightResource, "dimen", heightPackageName ?: context.packageName
				)
				if (heightRes > 0) {
					if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
						rv.setViewLayoutHeightDimen(
							targetId,
							heightRes
						)
					}
				}
			}
		}
	}

	fun resolveRemoteResources() {
		ensureManager()
		manager?.resolveRemoteResources()
	}

	fun build(packageName: String): android.widget.RemoteViews? {
		ensureManager()
		return manager?.build(id, packageName)
	}

	private fun ensureManager() {
		if (manager == null) {
			val mgr = RemoteViewsManager()
			mgr.add(this)
		}
	}

	internal fun buildSelf(packageName: String): android.widget.RemoteViews {
		stableId = R.id.ns_remote_view_root
		val rv = android.widget.RemoteViews(packageName, toLayoutId())
		commands.values.forEach { cmd -> cmd.applyTo(rv, stableId!!) }
		return rv
	}

	enum class Layout {
		AdapterViewFlipper,
		Button,
		Chronometer,
		FrameLayout,
		GridLayout,
		GridView,
		ImageButton,
		ImageView,
		LinearLayout,
		ListView,
		ProgressBar,
		RelativeLayout,
		StackView,
		TextView,
		ViewFlipper,
		TextClock
	}

	fun setBackgroundColor(value: Int): RemoteViews {
		commands["setBackgroundColor"] = Command.SetBackgroundColor(value)
		return this
	}

	fun setVisibility(visibility: Int): RemoteViews {
		commands["setVisibility"] = Command.SetVisibility(visibility)
		return this
	}

	fun setString(method: String, value: String): RemoteViews {
		commands["setString:$method"] = Command.SetString(method, value)
		return this
	}

	fun setByte(method: String, value: Byte): RemoteViews {
		commands["setByte:$method"] = Command.SetByte(method, value)
		return this
	}

	fun setInt(method: String, value: Int): RemoteViews {
		commands["setInt:$method"] = Command.SetInt(method, value)
		return this
	}

	fun setShort(method: String, value: Short): RemoteViews {
		commands["setShort:$method"] = Command.SetShort(method, value)
		return this
	}

	fun setLong(method: String, value: Long): RemoteViews {
		commands["setLong:$method"] = Command.SetLong(method, value)
		return this
	}

	fun setFloat(method: String, value: Float): RemoteViews {
		commands["setFloat:$method"] = Command.SetFloat(method, value)
		return this
	}

	fun setBoolean(method: String, value: Boolean): RemoteViews {
		commands["setBoolean:$method"] = Command.SetBoolean(method, value)
		return this
	}

	fun setWidth(value: Float, unit: Int): RemoteViews {
		commands["setWidth"] = Command.SetWidth(value, unit)
		return this
	}

	fun setHeight(value: Float, unit: Int): RemoteViews {
		commands["setHeight"] = Command.SetHeight(value, unit)
		return this
	}

	fun setSize(width: Float, widthUnit: Int, height: Float, heightUnit: Int): RemoteViews {
		commands["setSize"] = Command.SetSize(width, widthUnit, height, heightUnit)
		return this
	}

	fun setOnClickPendingIntent(intent: PendingIntent): RemoteViews {
		commands["setOnClickPendingIntent"] = Command.SetOnClickPendingIntent(intent)
		return this
	}

	fun toLayoutId(): Int {
		return when (layout) {
			Layout.AdapterViewFlipper -> R.layout.ns_remote_views_adapter_view_flipper
			Layout.Button -> R.layout.ns_remote_views_button
			Layout.Chronometer -> R.layout.ns_remote_views_chronometer
			Layout.FrameLayout -> R.layout.ns_remote_views_frame_layout
			Layout.GridLayout -> R.layout.ns_remote_views_grid_layout
			Layout.GridView -> R.layout.ns_remote_views_grid_view
			Layout.ImageButton -> R.layout.ns_remote_views_image_button
			Layout.ImageView -> R.layout.ns_remote_views_image_view
			Layout.LinearLayout -> R.layout.ns_remote_views_linear_layout
			Layout.ListView -> R.layout.ns_remote_views_list_view
			Layout.ProgressBar -> R.layout.ns_remote_views_progress_bar
			Layout.RelativeLayout -> R.layout.ns_remote_views_relative_layout
			Layout.StackView -> R.layout.ns_remote_views_stack_view
			Layout.TextView -> R.layout.ns_remote_views_text_view
			Layout.ViewFlipper -> R.layout.ns_remote_views_view_flipper
			Layout.TextClock -> R.layout.ns_remote_views_text_clock
		}
	}

	fun findViewById(id: String): RemoteViews? {
		return manager?.findViewById(this.id, id)
	}

	fun getCommands(): MutableMap<String, Command> {
		return commands
	}

	class AdapterViewFlipper(id: String = generateId()) : RemoteViews(Layout.AdapterViewFlipper, id)

	class Button(id: String = generateId()) : RemoteViews(Layout.Button, id), TextLike

	class Chronometer(id: String = generateId()) : RemoteViews(Layout.Chronometer, id)

	class FrameLayout(id: String = generateId()) : RemoteViews(Layout.FrameLayout, id), ViewGroupLike

	class GridLayout(id: String = generateId()) : RemoteViews(Layout.GridLayout, id), ViewGroupLike

	class GridView(id: String = generateId()) : RemoteViews(Layout.GridView, id), ViewGroupLike

	class ImageButton(id: String = generateId()) : RemoteViews(Layout.ImageButton, id), ImageLike

	class ImageView(id: String = generateId()) : RemoteViews(Layout.ImageView, id), ImageLike

	class LinearLayout(id: String = generateId()) : RemoteViews(Layout.LinearLayout, id),
		ViewGroupLike

	class ListView(id: String = generateId()) : RemoteViews(Layout.ListView, id)

	class ProgressBar(id: String = generateId()) : RemoteViews(Layout.ProgressBar, id)

	class RelativeLayout(id: String = generateId()) : RemoteViews(Layout.RelativeLayout, id),
		ViewGroupLike

	class StackView(id: String = generateId()) : RemoteViews(Layout.StackView, id), ViewGroupLike

	class TextView(id: String = generateId()) : RemoteViews(Layout.TextView, id), TextLike

	class ViewFlipper(id: String = generateId()) : RemoteViews(Layout.ViewFlipper, id), ViewGroupLike

	class TextClock(id: String = generateId()) : RemoteViews(Layout.TextClock, id), TextLike

	interface TextLike {
		fun getCommands(): MutableMap<String, Command>

		fun setText(value: String): TextLike {
			getCommands()["setText"] = Command.SetText(value)
			return this
		}

		fun setTextColor(value: Int): TextLike {
			getCommands()["setTextColor"] = Command.SetTextColor(value)
			return this
		}
	}

	interface ViewGroupLike {
		fun addView(child: RemoteViews): ViewGroupLike {
			val self = this as RemoteViews
			self.ensureManager()
			self.manager?.add(child, self.id)
			return this
		}

		fun removeView(child: RemoteViews): ViewGroupLike {
			val self = this as RemoteViews
			child.id.let { self.manager?.remove(it) }
			return this
		}
	}

	interface ImageLike {
		fun getCommands(): MutableMap<String, Command>

		fun setImageResource(value: Int): ImageLike {
			getCommands()["setImageResource"] = Command.SetImageResource(value)
			return this
		}

		fun setImageURI(value: Uri?): ImageLike {
			getCommands()["setImageURI"] = Command.SetImageURI(value)
			return this
		}

		fun setImageBitmap(value: Bitmap): ImageLike {
			getCommands()["setImageBitmap"] = Command.SetImageBitmap(value)
			return this
		}

		fun setImageUrl(url: String): ImageLike {
			getCommands()["setImageUrl"] = Command.SetImageUrl(url)
			return this
		}
	}
}

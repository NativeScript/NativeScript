package org.nativescript.widgets

import android.app.ActivityManager
import android.content.Context
import android.content.res.Resources
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.ColorMatrix
import android.graphics.ColorMatrixColorFilter
import android.graphics.Paint
import android.graphics.PorterDuff
import android.graphics.PorterDuffColorFilter
import android.graphics.RenderEffect
import android.graphics.RenderNode
import android.graphics.Shader
import android.os.Build
import android.renderscript.Allocation
import android.renderscript.Element
import android.renderscript.RenderScript
import android.renderscript.ScriptIntrinsicBlur
import android.view.View
import androidx.annotation.RequiresApi
import androidx.collection.LruCache
import androidx.core.graphics.createBitmap
import org.nativescript.widgets.CSSFilters.FilterHelper.Companion.createDropShadowBitmap
import java.util.WeakHashMap
import kotlin.math.ceil
import kotlin.math.cos
import kotlin.math.sin

private val FILTER_REGEX = Regex("""(\w+(?:-\w+)?)\(([^()]*(?:\([^()]*\)[^()]*)*)\)""")
private val SPLIT_REGEX = Regex("\\s+")
private const val PI_FLOAT = Math.PI.toFloat()
private const val RAD_TO_DEG = (180f / PI_FLOAT)


class CSSFilters {

	sealed class Filter {
		data class Blur(val radiusPx: Float) : Filter()
		data class Brightness(val value: Float) : Filter()
		data class Contrast(val value: Float) : Filter()
		data class Saturate(val value: Float) : Filter()
		data class HueRotate(val degrees: Float) : Filter()
		data class Invert(val amount: Float) : Filter() // 0..1
		data class Opacity(val amount: Float) : Filter()   // 0..1
		data class Sepia(val amount: Float) : Filter()    // 0..1
		data class Grayscale(val amount: Float) : Filter()    // 0..1
		data class DropShadow(
			val offsetX: Float,
			val offsetY: Float,
			val blur: Float,
			val color: Int
		) : Filter()
	}

	internal class BitmapPool(context: Context) {
		// How many bytes this pool is allowed to use
		private val maxSizeBytes: Int

		init {
			val am = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
			val totalMem = am.memoryClass * 1024 * 1024
			maxSizeBytes = totalMem / 4 // 1/4 of app’s heap
		}

		private fun bitmapByteSize(b: Bitmap): Int =
			b.allocationByteCount   // safest API; works pre/post 26

		/** LRUCache over *bytes* */
		private val pool = object : LruCache<String, Bitmap>(maxSizeBytes) {
			override fun sizeOf(key: String, value: Bitmap): Int {
				return bitmapByteSize(value) // LRU will evict by total bytes
			}

			override fun entryRemoved(
				evicted: Boolean,
				key: String,
				oldValue: Bitmap,
				newValue: Bitmap?
			) {
				if (!oldValue.isRecycled) oldValue.recycle()
			}
		}

		private fun key(
			width: Int,
			height: Int,
			config: Bitmap.Config
		) = "$width:$height:${config.name}"


		fun getSourceBitmap(
			width: Int,
			height: Int,
			config: Bitmap.Config = Bitmap.Config.ARGB_8888,
		): Bitmap {
			val k = "${key(width, height, config)}:source"
			val cached = pool[k]
			return if (cached != null && !cached.isRecycled) {
				cached.eraseColor(Color.TRANSPARENT) // clear previous content
				cached
			} else {
				createBitmap(width, height, config)
			}
		}

		fun getBitmap(
			width: Int,
			height: Int,
			config: Bitmap.Config = Bitmap.Config.ARGB_8888,
		): Bitmap {
			val k = key(width, height, config)
			val cached = pool[k]
			return if (cached != null && !cached.isRecycled) {
				cached.eraseColor(Color.TRANSPARENT) // clear previous content
				cached
			} else {
				createBitmap(width, height, config)
			}
		}

		fun putBitmap(bitmap: Bitmap, source: Boolean? = null) {
			if (bitmap.isRecycled) return
			var k = key(bitmap.width, bitmap.height, bitmap.config ?: Bitmap.Config.ARGB_8888)
			if (source == true) {
				k = "$k:source"
			}
			if (pool[k] == null) {
				pool.put(k, bitmap)
			}
		}

		fun clear() {
			pool.evictAll()
		}
	}

	@Suppress("DEPRECATION")
	internal class FilterHelper {
		internal var source: Bitmap? = null
		internal var shadowsOrBlurs: MutableList<Bitmap> = mutableListOf()
		internal var cssFilter: ColorMatrix? = null

		internal var getOrInitCssFilter: ColorMatrix
			get() {
				if (cssFilter == null) cssFilter = ColorMatrix()
				return cssFilter!!
			}
			set(value) {
				cssFilter = value
			}

		companion object {
			fun createBlurBitmap(
				context: Context,
				width: Int,
				height: Int,
				blurRadius: Float,
				source: Bitmap,
				rs: RenderScript?
			): Bitmap {
				var destroyRS = false
				var renderScript = rs

				if (rs == null) {
					renderScript = RenderScript.create(context)
					destroyRS = true
				}

				val input = Allocation.createFromBitmap(rs, source)
				val output = Allocation.createTyped(rs, input.type)
				val script = ScriptIntrinsicBlur.create(rs, Element.U8_4(rs))
				script.setRadius(blurRadius.coerceIn(0f, 25f))
				script.setInput(input)
				script.forEach(output)

				val blurred = createBitmap(width, height)
				output.copyTo(blurred)

				if (destroyRS) {
					renderScript?.destroy()
				}

				return blurred
			}

			fun createDropShadowBitmap(
				context: Context,
				offsetX: Float,
				offsetY: Float,
				width: Int,
				height: Int,
				blurRadius: Float,
				color: Int,
				source: Bitmap,
				rs: RenderScript? = null,
				destination: Canvas? = null
			): Bitmap {
				val pool = getPool(context)

				// try cache first
				val key = makeShadowCacheKey(source, offsetX, offsetY, blurRadius, color, width, height)
				dropShadowCache[key]?.let { cached ->
					// cached is immutable/shared — return directly
					return cached
				}

				// compute padding to account for blur spread and support negative offsets
				val pad = ceil(blurRadius * 3f).toInt().coerceAtLeast(0)
				val offLeft = ceil(maxOf(0f, -offsetX)).toInt()
				val offRight = ceil(maxOf(0f, offsetX)).toInt()
				val offTop = ceil(maxOf(0f, -offsetY)).toInt()
				val offBottom = ceil(maxOf(0f, offsetY)).toInt()

				val leftPad = pad + offLeft
				val rightPad = pad + offRight
				val topPad = pad + offTop
				val bottomPad = pad + offBottom

				val outW = (width + leftPad + rightPad).coerceAtLeast(1)
				val outH = (height + topPad + bottomPad).coerceAtLeast(1)

				val shadowBmp = pool.getBitmap(outW, outH, source.config ?: Bitmap.Config.ARGB_8888)
				// ensure transparent background
				shadowBmp.eraseColor(Color.TRANSPARENT)
				val canvas = destination ?: Canvas(shadowBmp)

				var destroyRS = false
				var renderScript = rs

				if (rs == null) {
					renderScript = RenderScript.create(context)
					destroyRS = true
				}

				val paint = Paint().apply {
					isAntiAlias = true
					isFilterBitmap = true
					colorFilter = PorterDuffColorFilter(color, PorterDuff.Mode.SRC_IN)
				}

				if (blurRadius > 0f) {
					renderScript?.let { rsInner ->
						// create a temp bitmap larger than source so blur doesn't get clipped
						val tempW = source.width + pad * 2
						val tempH = source.height + pad * 2
						val tempBmp = pool.getBitmap(tempW, tempH, source.config ?: Bitmap.Config.ARGB_8888)

						// draw source centered into tempBmp (pad margin)
						val tempCanvas = Canvas(tempBmp)
						tempCanvas.drawBitmap(source, pad.toFloat(), pad.toFloat(), null)

						// run blur on tempBmp -> blurredBmp
						val input = Allocation.createFromBitmap(rsInner, tempBmp)
						val output = Allocation.createTyped(rsInner, input.type)
						val script = ScriptIntrinsicBlur.create(rsInner, Element.U8_4(rsInner))
						script.setRadius(blurRadius.coerceIn(0f, 25f))
						script.setInput(input)
						script.forEach(output)

						val blurred = pool.getBitmap(tempW, tempH, tempBmp.config ?: Bitmap.Config.ARGB_8888)
						output.copyTo(blurred)

						val targetSourceX = leftPad.toFloat()
						val targetSourceY = topPad.toFloat()

						val drawX = targetSourceX - pad + offsetX
						val drawY = targetSourceY - pad + offsetY

						canvas.drawBitmap(blurred, drawX, drawY, paint)

						// return temporary bitmaps to pool
						pool.putBitmap(tempBmp)
						pool.putBitmap(blurred)
					}
				} else {
					// No blur — draw the tinted source directly at the offset
					val targetSourceX = leftPad.toFloat()
					val targetSourceY = topPad.toFloat()
					canvas.drawBitmap(source, targetSourceX + offsetX, targetSourceY + offsetY, paint)
				}

				if (destroyRS) {
					renderScript?.destroy()
				}

				// copy pooled shadow into an immutable cached bitmap and return pooled one to pool
				val cachedCopy = shadowBmp.copy(Bitmap.Config.ARGB_8888, false)
				// return the pooled shadow back to the pool, cachedCopy is the shared result
				pool.putBitmap(shadowBmp)
				dropShadowCache.put(key, cachedCopy)


				return cachedCopy
			}


			fun build(view: View, filters: List<Filter>, draw: (Canvas) -> Unit): FilterHelper {
				val helper = FilterHelper()
				val pool = getPool(view.context)
				val source = pool.getBitmap(view.width, view.height, Bitmap.Config.ARGB_8888)
				val canvas = Canvas(source)
				draw(canvas)
				helper.source = source
				pool.putBitmap(source)
				var rs: RenderScript? = null
				for (filter in filters) {
					when (filter) {
						is Filter.Blur -> {
							if (filter.radiusPx > 0f) {
								if (rs == null) {
									rs = RenderScript.create(view.context)
								}
								helper.shadowsOrBlurs.add(
									createBlurBitmap(
										view.context, view.width, view.height, filter.radiusPx, source, rs
									)
								)
							}
						}

						is Filter.Brightness -> {
							helper.getOrInitCssFilter.postConcat(
								ColorMatrix(brightness(filter.value))
							)
						}

						is Filter.Contrast -> {
							helper.getOrInitCssFilter.postConcat(
								ColorMatrix(contrast(filter.value))
							)
						}

						is Filter.DropShadow -> {

							val key = makeShadowCacheKey(
								source,
								filter.offsetX,
								filter.offsetY,
								filter.blur,
								filter.color,
								view.width,
								view.height
							)

							keyToView[view]?.add(key) ?: run {
								keyToView[view] = HashSet<String>().apply {
									add(key)
								}
							}

							helper.shadowsOrBlurs.add(
								createDropShadowBitmap(
									view.context,
									filter.offsetX,
									filter.offsetY,
									view.width,
									view.height,
									filter.blur,
									filter.color,
									source,
									rs
								)
							)
						}

						is Filter.HueRotate -> {
							helper.getOrInitCssFilter.postConcat(
								ColorMatrix(hue(filter.degrees))
							)
						}

						is Filter.Invert -> {
							helper.getOrInitCssFilter.postConcat(
								ColorMatrix(invert(filter.amount))
							)
						}

						is Filter.Opacity -> {
							helper.getOrInitCssFilter.postConcat(
								ColorMatrix(opacity(filter.amount))
							)
						}

						is Filter.Saturate -> {
							helper.getOrInitCssFilter.postConcat(
								ColorMatrix(saturate(filter.value))
							)
						}

						is Filter.Sepia -> {
							helper.getOrInitCssFilter.postConcat(
								ColorMatrix(sepia(filter.amount))
							)
						}

						is Filter.Grayscale -> {
							helper.getOrInitCssFilter.postConcat(
								ColorMatrix(grayscale(filter.amount))
							)
						}
					}

				}
				rs?.destroy()
				return helper
			}
		}
	}

	internal data class ShadowOrBlur(val shadow: RenderNode? = null, val blur: Bitmap? = null)

	@Suppress("DEPRECATION")
	@RequiresApi(Build.VERSION_CODES.Q)
	internal class FilterHelperV2 {
		internal var sourceFallback: Bitmap? = null
		internal val sourceNode: RenderNode by lazy { RenderNode("source") }
		internal var cssFilter: ColorMatrix? = null
		internal val shadowsOrBlurs: MutableList<ShadowOrBlur> = mutableListOf()

		internal var getOrInitCssFilter: ColorMatrix
			get() {
				if (cssFilter == null) cssFilter = ColorMatrix()
				return cssFilter!!
			}
			set(value) {
				cssFilter = value
			}

		companion object {
			fun build(view: View, filters: List<Filter>, draw: (Canvas) -> Unit): FilterHelperV2 {
				val helper = FilterHelperV2()
				val pool = getPool(view.context)
				var rs: RenderScript? = null
				var needsBitmapFallback = false

				// Try recording directly to RenderNode
				try {
					helper.sourceNode.setPosition(0, 0, view.width, view.height)
					val canvas = helper.sourceNode.beginRecording()
					draw(canvas)
					helper.sourceNode.endRecording()
				} catch (_: Exception) {
					// Some devices forbid hardware-backed RenderNode drawing
					needsBitmapFallback = true
				}

				// Fallback to bitmap if RenderNode recording fails
				if (needsBitmapFallback) {
					helper.sourceFallback = pool.getSourceBitmap(view.width, view.height)
					val canvas = Canvas(helper.sourceFallback!!)
					draw(canvas)
				}


				for (filter in filters) {
					when (filter) {
						is Filter.Blur -> {
							if (filter.radiusPx > 0f) {
								val source =
									helper.sourceFallback ?: pool.getSourceBitmap(view.width, view.height).also {
										val c = Canvas(it)
										view.setTag(R.id.tag_suppress_ops, true)
										view.draw(c)
										view.setTag(R.id.tag_suppress_ops, false)
									}

								if (rs == null) rs = RenderScript.create(view.context)
								val input = Allocation.createFromBitmap(rs, source)
								val output = Allocation.createTyped(rs, input.type)
								val script = ScriptIntrinsicBlur.create(rs, Element.U8_4(rs))
								script.setRadius(filter.radiusPx.coerceIn(0.0001f, 25f))
								script.setInput(input)
								script.forEach(output)

								val blurBmp = pool.getBitmap(view.width, view.height)
								output.copyTo(blurBmp)

								if (!needsBitmapFallback) {
									val blurNode = RenderNode("blurNode")
									blurNode.setPosition(0, 0, view.width, view.height)
									val blurCanvas = blurNode.beginRecording()
									blurCanvas.drawBitmap(
										blurBmp, 0F, 0F, null
									)
									blurNode.endRecording()
									helper.shadowsOrBlurs.add(ShadowOrBlur(blurNode))
								} else {
									helper.shadowsOrBlurs.add(ShadowOrBlur(null, blurBmp))
								}
							}
						}

						is Filter.DropShadow -> {
							val src = helper.sourceFallback
								?: pool.getBitmap(view.width, view.height).also {
									val c = Canvas(it)
									view.setTag(R.id.tag_suppress_ops, true)
									view.draw(c)
									view.setTag(R.id.tag_suppress_ops, false)
								}

							val shadowBmp = createDropShadowBitmap(
								view.context,
								filter.offsetX,
								filter.offsetY,
								view.width,
								view.height,
								filter.blur,
								filter.color,
								src,
								rs
							)

							helper.shadowsOrBlurs.add(ShadowOrBlur(null, shadowBmp))

							/*
							if (!needsBitmapFallback) {
								val shadowNode = RenderNode("shadow").apply {
									setPosition(
										0,
										0,
										view.width + filter.offsetX.toInt(),
										view.height + filter.offsetY.toInt()
									)
									val shadowCanvas = beginRecording()
									shadowCanvas.drawBitmap(shadowBmp, 0f, 0f, null)
									endRecording()
								}
								helper.shadowsOrBlurs.add(ShadowOrBlur(shadowNode))
							} else {
								helper.shadowsOrBlurs.add(ShadowOrBlur(null, shadowBmp))
							}
							*/
							// shadowBmp will be recycled later when pool evicts
						}

						is Filter.Brightness -> helper.getOrInitCssFilter.postConcat(brightness(filter.value))
						is Filter.Contrast -> helper.getOrInitCssFilter.postConcat(contrast(filter.value))
						is Filter.Saturate -> helper.getOrInitCssFilter.postConcat(saturate(filter.value))
						is Filter.HueRotate -> helper.getOrInitCssFilter.postConcat(hue(filter.degrees))
						is Filter.Invert -> helper.getOrInitCssFilter.postConcat(invert(filter.amount))
						is Filter.Opacity -> helper.getOrInitCssFilter.postConcat(opacity(filter.amount))
						is Filter.Sepia -> helper.getOrInitCssFilter.postConcat(sepia(filter.amount))
						is Filter.Grayscale -> helper.getOrInitCssFilter.postConcat(grayscale(filter.amount))
					}
				}

				rs?.destroy()
				return helper
			}
		}
	}

	@RequiresApi(Build.VERSION_CODES.S)
	internal class FilterHelperV3 {
		internal var filter: RenderEffect? = null

		internal val sourceNode: RenderNode by lazy {
			RenderNode("source")
		}

		internal var hasComposite = false
		internal val compositeNode: RenderNode by lazy {
			hasComposite = true
			RenderNode("composite")
		}

		internal var shadowNodes: ArrayList<RenderNode> = arrayListOf()

		companion object {
			fun build(view: View, filters: List<Filter>, draw: (Canvas) -> Unit): FilterHelperV3 {
				val helper = FilterHelperV3()
				var sourceDrawn = false


				val effects = mutableListOf<RenderEffect>()
				for (filter in filters) {
					when (filter) {
						is Filter.Blur -> {
							if (filter.radiusPx > 0) {
								effects.add(
									RenderEffect.createBlurEffect(
										filter.radiusPx, filter.radiusPx, Shader.TileMode.CLAMP
									)
								)
							}
						}

						is Filter.Brightness -> {
							effects.add(
								RenderEffect.createColorFilterEffect(ColorMatrixColorFilter(brightness(filter.value)))
							)
						}

						is Filter.Contrast -> {
							effects.add(
								RenderEffect.createColorFilterEffect(ColorMatrixColorFilter(contrast(filter.value)))
							)
						}

						is Filter.DropShadow -> {

							if (!sourceDrawn) {
								helper.sourceNode.setPosition(0, 0, view.width, view.height)
								val sourceCanvas = helper.sourceNode.beginRecording()

								view.setTag(R.id.tag_suppress_ops, true)
								view.draw(sourceCanvas)
								view.setTag(R.id.tag_suppress_ops, false)

								helper.sourceNode.endRecording()
								sourceDrawn = true
							}

							val colorFilter = ColorMatrixColorFilter(
								ColorMatrix(
									floatArrayOf(
										0f, 0f, 0f, 0f, Color.red(filter.color).toFloat(),
										0f, 0f, 0f, 0f, Color.green(filter.color).toFloat(),
										0f, 0f, 0f, 0f, Color.blue(filter.color).toFloat(),
										0f, 0f, 0f, Color.alpha(filter.color) / 255f, 0f
									)
								)
							)

							val colorEffect = RenderEffect.createColorFilterEffect(colorFilter)

							val shadowEffect = if (filter.blur > 0f) {
								val blurEffect = RenderEffect.createBlurEffect(
									filter.blur, filter.blur, Shader.TileMode.CLAMP
								)
								RenderEffect.createChainEffect(colorEffect, blurEffect)
							} else {
								colorEffect
							}

							val offsetEffect = RenderEffect.createOffsetEffect(
								filter.offsetX,
								filter.offsetY,
								shadowEffect
							)

							val shadowNode = RenderNode("shadow")
							shadowNode.setRenderEffect(offsetEffect)
							shadowNode.setPosition(
								0,
								0,
								view.width + kotlin.math.abs(filter.offsetX).toInt() + filter.blur.toInt() * 3,
								view.height + kotlin.math.abs(filter.offsetY).toInt() + filter.blur.toInt() * 3
							)

							val shadowCanvas = shadowNode.beginRecording()
							shadowCanvas.drawRenderNode(helper.sourceNode)
							shadowNode.endRecording()

							helper.shadowNodes.add(shadowNode)
						}

						is Filter.HueRotate -> {
							effects.add(
								RenderEffect.createColorFilterEffect(ColorMatrixColorFilter(hue(filter.degrees)))
							)
						}

						is Filter.Invert -> {
							effects.add(
								RenderEffect.createColorFilterEffect(ColorMatrixColorFilter(invert(filter.amount)))
							)
						}

						is Filter.Opacity -> {
							effects.add(
								RenderEffect.createColorFilterEffect(ColorMatrixColorFilter(opacity(filter.amount)))
							)
						}

						is Filter.Saturate -> {
							effects.add(
								RenderEffect.createColorFilterEffect(ColorMatrixColorFilter(saturate(filter.value)))
							)
						}

						is Filter.Sepia -> {
							effects.add(
								RenderEffect.createColorFilterEffect(ColorMatrixColorFilter(sepia(filter.amount)))
							)
						}

						is Filter.Grayscale -> {
							effects.add(
								RenderEffect.createColorFilterEffect(ColorMatrixColorFilter(grayscale(filter.amount)))
							)
						}
					}

				}
				helper.filter = chain(*effects.toTypedArray())
				helper.filter?.let {

					if (helper.shadowNodes.isNotEmpty()) {
						helper.compositeNode.setPosition(0, 0, view.width, view.height)

						val compositeCanvas = helper.compositeNode.beginRecording()

						for (node in helper.shadowNodes) {
							compositeCanvas.drawRenderNode(node)
						}

						compositeCanvas.drawRenderNode(helper.sourceNode)

						helper.compositeNode.endRecording()
						helper.compositeNode.setRenderEffect(helper.filter)
					}
				}
				return helper
			}
		}
	}

	class CSSFilter(css: String, val filters: List<Filter>) {
		internal var invalid = false

		internal var css: String = ""

		internal var v1: FilterHelper? = null

		internal var v2: Any? = null

		internal var v3: Any? = null

		init {
			this.css = css
		}

		fun renderFilters(view: View, canvas: Canvas, draw: (Canvas) -> Unit) {
			val invalid = !(view.width > 0 && view.height > 0)

			if (invalid) {
				this.invalid = true
				return
			}
			this.invalid = false

			if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
				val filter = FilterHelperV3.build(view, filters, draw)
				v3 = filter
				if (filter.shadowNodes.isEmpty()) {
					view.setRenderEffect(filter.filter)
				} else {
					view.setRenderEffect(null)
					if (filter.hasComposite) {
						canvas.drawRenderNode(filter.compositeNode)
					} else {
						for (node in filter.shadowNodes) {
							canvas.drawRenderNode(node)
						}
						filter.sourceNode.setRenderEffect(filter.filter)
						canvas.drawRenderNode(filter.sourceNode)
					}
				}

				return
			} else if (view.isHardwareAccelerated && Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
				val filter = FilterHelperV2.build(view, filters, draw)
				v2 = filter
				val checkpoint = canvas.saveLayer(null, null)

				// If there's a color matrix that must affect both shadows and source,
				// composite shadows + source into an offscreen bitmap and then draw with the color filter.
				filter.cssFilter?.let { matrix ->
					val pool = getPool(view.context)
					val tmp = pool.getSourceBitmap(view.width, view.height)
					val tmpCanvas = Canvas(tmp)
					// draw shadows/blurs into temp
					for (node in filter.shadowsOrBlurs) {
						node.shadow?.let {
							tmpCanvas.drawRenderNode(it)
						}
						node.blur?.let {
							tmpCanvas.drawBitmap(it, 0f, 0f, null)
						}
					}

					// draw source into temp (use recorded fallback if available)
					val sourceBmp = filter.sourceFallback ?: run {
						val bmp = pool.getSourceBitmap(view.width, view.height)
						val c = Canvas(bmp)
						view.setTag(R.id.tag_suppress_ops, true)
						view.draw(c)
						view.setTag(R.id.tag_suppress_ops, false)
						bmp
					}

					tmpCanvas.drawBitmap(sourceBmp, 0f, 0f, null)

					// draw composited temp with color matrix applied
					val paint = Paint().apply {
						colorFilter = ColorMatrixColorFilter(matrix)
					}
					canvas.drawBitmap(tmp, 0f, 0f, paint)
					//  pool.putBitmap(tmp, true)
				} ?: run {
					// no color matrix -> draw shadows/blurs + source directly
					for (node in filter.shadowsOrBlurs) {
						node.shadow?.let {
							canvas.drawRenderNode(it)
						}
						node.blur?.let {
							canvas.drawBitmap(it, 0f, 0f, null)
						}
					}

					filter.sourceFallback?.let { src ->
						canvas.drawBitmap(src, 0f, 0f, null)
					} ?: run {
						canvas.drawRenderNode(filter.sourceNode)
					}
				}

				canvas.restoreToCount(checkpoint)
				return
			}


			v1 = FilterHelper.build(view, filters, draw)
			v1?.let {
				for (bm in it.shadowsOrBlurs) {
					canvas.drawBitmap(bm, 0f, 0f, null)
				}

				it.source?.let { source ->
					it.cssFilter?.let { matrix ->
						val paint = Paint().apply {
							colorFilter = ColorMatrixColorFilter(matrix)
						}
						canvas.drawBitmap(source, 0f, 0f, paint)
					} ?: run {
						canvas.drawBitmap(source, 0f, 0f, null)
					}
				}

			}
		}
	}

	companion object {

		private var mPool: BitmapPool? = null

		internal fun getPool(context: Context): BitmapPool {
			if (mPool == null) {
				mPool = BitmapPool(context)
			}
			// failure is not an option!!!
			return mPool!!
		}

		@RequiresApi(Build.VERSION_CODES.S)
		private fun chain(vararg effects: RenderEffect?): RenderEffect? {
			var out: RenderEffect? = null
			for (e in effects) {
				if (e == null) continue
				out = if (out == null) e else RenderEffect.createChainEffect(e, out)
			}
			return out
		}

		private fun grayscale(value: Float): ColorMatrix {
			val cm = ColorMatrix()
			val sat = 1f - value
			cm.setSaturation(sat)
			return cm
		}

		private fun brightness(value: Float): ColorMatrix {
			// value = 1 → normal
			val cm = ColorMatrix(
				floatArrayOf(
					value, 0f, 0f, 0f, 0f,
					0f, value, 0f, 0f, 0f,
					0f, 0f, value, 0f, 0f,
					0f, 0f, 0f, 1f, 0f
				)
			)
			return cm
		}

		private fun contrast(value: Float): ColorMatrix {
			val t = 128f * (1f - value)
			return ColorMatrix(
				floatArrayOf(
					value, 0f, 0f, 0f, t,
					0f, value, 0f, 0f, t,
					0f, 0f, value, 0f, t,
					0f, 0f, 0f, 1f, 0f
				)
			)
		}

		private fun hue(degrees: Float): ColorMatrix {
			val rotation = degrees * Math.PI / 180
			val cos = cos(rotation).toFloat()
			val sin = sin(rotation).toFloat()

			val r1 = floatArrayOf(
				0.213f + cos * 0.787f - sin * 0.213f,
				0.715f - cos * 0.715f - sin * 0.715f,
				0.072f - cos * 0.072f + sin * 0.928f,
				0f, 0f
			)
			val r2 = floatArrayOf(
				0.213f - cos * 0.213f + sin * 0.143f,
				0.715f + cos * 0.285f + sin * 0.140f,
				0.072f - cos * 0.072f - sin * 0.283f,
				0f, 0f
			)
			val r3 = floatArrayOf(
				0.213f - cos * 0.213f - sin * 0.787f,
				0.715f - cos * 0.715f + sin * 0.715f,
				0.072f + cos * 0.928f + sin * 0.072f,
				0f, 0f
			)

			val cm = ColorMatrix()
			cm.set(arrayOf(r1, r2, r3, floatArrayOf(0f, 0f, 0f, 1f, 0f)).flatMap { it.toList() }
				.toFloatArray())
			return cm
		}

		private fun opacity(alpha: Float): ColorMatrix {
			return ColorMatrix(
				floatArrayOf(
					1f, 0f, 0f, 0f, 0f,
					0f, 1f, 0f, 0f, 0f,
					0f, 0f, 1f, 0f, 0f,
					0f, 0f, 0f, alpha, 0f
				)
			)
		}

		private fun sepia(percent: Float): ColorMatrix {
			val t = percent.coerceIn(0f, 1f)

			val sepia = floatArrayOf(
				0.393f, 0.769f, 0.189f, 0f, 0f,
				0.349f, 0.686f, 0.168f, 0f, 0f,
				0.272f, 0.534f, 0.131f, 0f, 0f,
				0f, 0f, 0f, 1f, 0f
			)

			val identity = FloatArray(20) { i -> if (i % 6 == 0) 1f else 0f } // identity matrix

			val result = FloatArray(20) { i ->
				identity[i] * (1f - t) + sepia[i] * t
			}

			return ColorMatrix(result)
		}

		private fun invert(percent: Float): ColorMatrix {
			val t = percent.coerceIn(0f, 1f)

			val identity = floatArrayOf(
				1f, 0f, 0f, 0f, 0f,
				0f, 1f, 0f, 0f, 0f,
				0f, 0f, 1f, 0f, 0f,
				0f, 0f, 0f, 1f, 0f
			)

			val invert = floatArrayOf(
				-1f, 0f, 0f, 0f, 255f,
				0f, -1f, 0f, 0f, 255f,
				0f, 0f, -1f, 0f, 255f,
				0f, 0f, 0f, 1f, 0f
			)

			val result = FloatArray(20) { i ->
				identity[i] * (1f - t) + invert[i] * t
			}

			return ColorMatrix(result)
		}

		private fun saturate(percent: Float): ColorMatrix {
			val cm = ColorMatrix()
			cm.setSaturation(percent)
			return cm
		}

		internal fun parseCssColor(value: String): Int {
			val trimmed = value.trim().lowercase()

			return when {
				trimmed.startsWith("#") -> {
					val hex = trimmed.removePrefix("#")
					when (hex.length) {
						3 -> {
							// #RGB → expand
							val r = hex[0].toString().repeat(2).toInt(16)
							val g = hex[1].toString().repeat(2).toInt(16)
							val b = hex[2].toString().repeat(2).toInt(16)
							0xFF000000.toInt() or (r shl 16) or (g shl 8) or b
						}

						6 -> {
							// #RRGGBB
							0xFF000000.toInt() or hex.toInt(16)
						}

						8 -> {
							// #AARRGGBB
							hex.toLong(16).toInt()
						}

						else -> Color.BLACK
					}
				}

				trimmed.startsWith("rgb(") -> {
					val nums =
						trimmed.removePrefix("rgb(").removeSuffix(")").split(",").map { it.trim().toInt() }
					val (r, g, b) = nums
					0xFF000000.toInt() or (r shl 16) or (g shl 8) or b
				}

				trimmed.startsWith("rgba(") -> {
					val nums = trimmed.removePrefix("rgba(").removeSuffix(")").split(",").map { it.trim() }
					val r = nums[0].toInt()
					val g = nums[1].toInt()
					val b = nums[2].toInt()
					val a = (nums[3].toFloat() * 255f).toInt().coerceIn(0, 255)
					(a shl 24) or (r shl 16) or (g shl 8) or b
				}

				else -> COLOR_MAP[trimmed] ?: Color.BLACK
			}
		}

		private fun parseCssAngle(value: String): Float {
			val trimmed = value.trim().lowercase()
			return when {
				trimmed.endsWith("deg") -> trimmed.removeSuffix("deg").toFloatOrNull() ?: 0f
				trimmed.endsWith("grad") -> (trimmed.removeSuffix("grad").toFloatOrNull() ?: 0f) * 0.9f
				trimmed.endsWith("rad") -> (trimmed.removeSuffix("rad").toFloatOrNull() ?: 0f) * RAD_TO_DEG
				trimmed.endsWith("turn") -> (trimmed.removeSuffix("turn").toFloatOrNull() ?: 0f) * 360f
				else -> trimmed.toFloatOrNull() ?: 0f
			}
		}

		private fun parseCssFloat(
			value: String,
			default: Float = 0f,
			canUseDip: Boolean = false
		): Float {
			return when {
				value.endsWith("px") -> value.removeSuffix("px").toFloatOrNull() ?: default
				value.endsWith("%") -> (value.removeSuffix("%").toFloatOrNull() ?: default) / 100f
				else -> {
					val ret = value.toFloatOrNull() ?: default
					if (canUseDip) {
						ret * Resources.getSystem().displayMetrics.density
					} else {
						ret
					}
				}
			}
		}

		private fun parseDropShadow(value: String): Filter.DropShadow? {
			val tokens = mutableListOf<String>()
			val sb = StringBuilder()
			var parenDepth = 0

			for (c in value.trim()) {
				when {
					c == '(' -> {
						parenDepth++
						sb.append(c)
					}

					c == ')' -> {
						parenDepth--
						sb.append(c)
					}

					c.isWhitespace() && parenDepth == 0 -> {
						if (sb.isNotEmpty()) {
							tokens.add(sb.toString())
							sb.clear()
						}
					}

					else -> sb.append(c)
				}
			}

			if (sb.isNotEmpty()) tokens.add(sb.toString())
			if (tokens.size < 2) return null

			val offsetX = parseCssFloat(tokens[0], 0f, true)
			val offsetY = parseCssFloat(tokens[1], 0f, true)
			val blur = if (tokens.size >= 3) parseCssFloat(tokens[2], 0f, true) else 0f

			val color = if (tokens.size >= 4) {
				parseCssColor(tokens.subList(3, tokens.size).joinToString(" "))
			} else {
				Color.BLACK
			}

			return Filter.DropShadow(offsetX, offsetY, blur, color)
		}


		// small LRU to avoid re-blurring identical source + params in the same runtime
		private val dropShadowCache = LruCache<String, Bitmap>(32)

		private fun makeShadowCacheKey(
			source: Bitmap,
			offsetX: Float,
			offsetY: Float,
			blurRadius: Float,
			color: Int,
			width: Int,
			height: Int
		): String {
			return "${System.identityHashCode(source)}:${source.width}x${source.height}:" +
				"${width}x${height}:" +
				"${offsetX.toDouble()}_${offsetY.toDouble()}_${blurRadius.toDouble()}_$color"
		}

		private val keyToView = WeakHashMap<View, HashSet<String>>()

		@JvmStatic
		fun invalidateCssFilters(view: View) {
			keyToView[view]?.let {
				for (key in it) {
					dropShadowCache.remove(key)
				}
			}
		}

		@JvmStatic
		fun parse(value: String): CSSFilter {
			val filters = mutableListOf<Filter>()

			FILTER_REGEX.findAll(value).forEach { match ->
				val name = match.groupValues[1].lowercase()
				val value = match.groupValues[2].trim()

				when (name) {
					"blur" -> filters.add(Filter.Blur(parseCssFloat(value, 0f, true)))
					"brightness" -> filters.add(Filter.Brightness(parseCssFloat(value, 1f)))
					"contrast" -> filters.add(Filter.Contrast(parseCssFloat(value, 1f)))
					"saturate" -> filters.add(Filter.Saturate(parseCssFloat(value, 1f)))
					"hue-rotate" -> filters.add(Filter.HueRotate(parseCssAngle(value)))
					"invert" -> filters.add(Filter.Invert(parseCssFloat(value, 0f)))
					"opacity" -> filters.add(Filter.Opacity(parseCssFloat(value, 1f)))
					"sepia" -> filters.add(Filter.Sepia(parseCssFloat(value, 0f)))
					"grayscale" -> filters.add(Filter.Grayscale(parseCssFloat(value, 0f)))
					"drop-shadow" -> parseDropShadow(value)?.let { filters.add(it) }
				}
			}

			return CSSFilter(
				if (filters.isNotEmpty()) {
					value
				} else {
					""
				}, filters
			)
		}
	}
}

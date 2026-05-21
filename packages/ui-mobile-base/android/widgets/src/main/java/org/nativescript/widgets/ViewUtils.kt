package org.nativescript.widgets

import android.graphics.Canvas
import android.os.Build
import androidx.core.graphics.withSave

class ViewUtils {
	companion object {
		private fun render(
			view: android.view.View,
			canvas: Canvas,
			filter: CSSFilters.CSSFilter?,
			superDraw: (Canvas) -> Unit,
		) {
			val suppressOps = view.getTag(R.id.tag_suppress_ops) as? Boolean ?: false
			if (suppressOps || (filter == null)) {
				superDraw(canvas)
				return
			}

			canvas.withSave {
				// Draw content with filters
				if (filter.filters.isEmpty()) {
					if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
						view.setRenderEffect(null)
					}
					superDraw(canvas)
					return
				}
				filter.renderFilters(view, canvas) { destCanvas ->
					if (filter.v1 != null || filter.v2 != null) {
						superDraw(destCanvas)
					}
				}
				if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
					if ((filter.v3 as? CSSFilters.FilterHelperV3)?.hasComposite != true) {
						superDraw(canvas)
					}
				}
			}
		}

		@JvmStatic
		fun onDraw(
			view: android.view.View,
			canvas: Canvas,
			filter: CSSFilters.CSSFilter?,
			superDraw: (Canvas) -> Unit,
		) {
			render(view, canvas, filter, superDraw)
		}

		@JvmStatic
		fun dispatchDraw(
			view: android.view.View,
			canvas: Canvas,
			filter: CSSFilters.CSSFilter?,
			superDraw: (Canvas) -> Unit,
		) {
			render(view, canvas, filter, superDraw)
		}
	}
}

package org.nativescript.widgetsdemo

import android.graphics.Color
import android.os.Bundle
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.widget.NestedScrollView
import org.nativescript.widgets.CommonLayoutParams
import org.nativescript.widgets.GridLayout
import org.nativescript.widgets.LayoutBase
import org.nativescript.widgets.StackLayout
import org.nativescript.widgets.Utils

class MainActivity : AppCompatActivity() {
	override fun onCreate(savedInstanceState: Bundle?) {
		super.onCreate(savedInstanceState)

		Utils.enableEdgeToEdge(this)
		val page = GridLayout(this)
		page.setBackgroundColor(Color.BLUE)
		page.overflowEdge = LayoutBase.OverflowEdgeDontApply
		page.layoutParams = CommonLayoutParams(
			ViewGroup.LayoutParams(
				ViewGroup.LayoutParams.MATCH_PARENT,
				ViewGroup.LayoutParams.MATCH_PARENT
			)
		)

		val svp = StackLayout(this)
		svp.layoutParams = CommonLayoutParams(
			ViewGroup.LayoutParams(
				ViewGroup.LayoutParams.MATCH_PARENT,
				ViewGroup.LayoutParams.MATCH_PARENT
			)
		)
		svp.overflowEdge = StackLayout.OverflowEdgeDontApply
		val scrollView = NestedScrollView(this)
		scrollView.layoutParams = CommonLayoutParams(
			ViewGroup.LayoutParams(
				ViewGroup.LayoutParams.WRAP_CONTENT,
				ViewGroup.LayoutParams.MATCH_PARENT
			)
		)
		svp.addView(scrollView)

		val container = StackLayout(this)
		container.setBackgroundColor(Color.RED)

		val text = TextView(this)
		text.text = getString(R.string.ipsum)
		text.textSize = 40f
		text.setTextColor(Color.WHITE)
		container.addView(text)
		scrollView.addView(container)
		page.addView(svp)
		val btn = Button(this)
		btn.text = "Toggle Overflow"
		val params = CommonLayoutParams(
			ViewGroup.LayoutParams(
				ViewGroup.LayoutParams.WRAP_CONTENT,
				ViewGroup.LayoutParams.WRAP_CONTENT
			)
		)
		params.width = 300
		params.height = 300
		params.width
		btn.layoutParams = params
		btn.setOnClickListener {
			svp.overflowEdge = when (svp.overflowEdge) {
				LayoutBase.OverflowEdgeNone -> {
					LayoutBase.OverflowEdgeDontApply
				}

				LayoutBase.OverflowEdgeDontApply -> {
					LayoutBase.OverflowEdgeTop
				}

				LayoutBase.OverflowEdgeTop -> {
					LayoutBase.OverflowEdgeBottom
				}

				LayoutBase.OverflowEdgeBottom -> {
					LayoutBase.OverflowEdgeTop.and(LayoutBase.OverflowEdgeBottom)
				}

				else -> LayoutBase.OverflowEdgeDontApply
			}
		}
		page.addView(btn)
		setContentView(page)
	}
}

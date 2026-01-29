package org.nativescript.widgetsdemo

import android.app.Dialog
import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.util.TypedValue
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.core.graphics.drawable.toDrawable
import androidx.core.view.postDelayed
import androidx.core.widget.NestedScrollView
import androidx.fragment.app.DialogFragment
import org.nativescript.widgets.CommonLayoutParams
import org.nativescript.widgets.ContentLayout
import org.nativescript.widgets.GridLayout
import org.nativescript.widgets.GridUnitType
import org.nativescript.widgets.LayoutBase
import org.nativescript.widgets.StackLayout
import org.nativescript.widgets.Utils

class MainActivity : AppCompatActivity() {

	class Frag : DialogFragment() {
		override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
			val dialog = super.onCreateDialog(savedInstanceState)

			val page = StackLayout(requireContext())
			page.setBackgroundColor(Color.BLUE)
			page.overflowEdge = LayoutBase.OverflowEdgeNone

			val content = StackLayout(requireContext())
			content.setBackgroundColor(Color.GREEN)
			val params = CommonLayoutParams(
				ViewGroup.LayoutParams(
					ViewGroup.LayoutParams.MATCH_PARENT,
					ViewGroup.LayoutParams.MATCH_PARENT
				)
			)

			params.widthPercent = 100f
			params.heightPercent = 100f

			content.layoutParams = params

			val txt = TextView(requireContext())
			txt.text = "Help"

			content.addView(
				txt
			)
			page.addView(
				content
			)

			dialog.setContentView(
				page, ViewGroup.LayoutParams(
					ViewGroup.LayoutParams.MATCH_PARENT,
					ViewGroup.LayoutParams.MATCH_PARENT
				)
			)

			dialog.window?.apply {
				Utils.enableEdgeToEdge(requireActivity(), this)
				setBackgroundDrawable(Color.TRANSPARENT.toDrawable())
			}


			return dialog
		}
	}

	override fun onCreate(savedInstanceState: Bundle?) {
		super.onCreate(savedInstanceState)

		Utils.enableEdgeToEdge(this)
		val frame = ContentLayout(this)

	//	frame.overflowEdge = LayoutBase.OverflowEdgeNone

		val page = GridLayout(this)


		val pageParams = CommonLayoutParams(
			ViewGroup.LayoutParams(
				ViewGroup.LayoutParams.MATCH_PARENT,
				ViewGroup.LayoutParams.MATCH_PARENT
			)
		)
		page.layoutParams = pageParams

		page.addRow(
			1, GridUnitType.auto
		)

		page.addRow(
			1, GridUnitType.star
		)


		val height = TypedValue().let { tv ->
			if (theme.resolveAttribute(android.R.attr.actionBarSize, tv, true)) {
				TypedValue.complexToDimensionPixelSize(tv.data, resources.displayMetrics)
			} else {
				ViewGroup.LayoutParams.WRAP_CONTENT
			}
		}

		val ab = Toolbar(this).apply {
			layoutParams = ViewGroup.LayoutParams(
				ViewGroup.LayoutParams.MATCH_PARENT,
				height
			)
			setBackgroundColor(Color.BLACK)   // REQUIRED or it's invisible
			setTitleTextColor(Color.WHITE)    // REQUIRED to see the title
		}


		page.addView(ab)

		setSupportActionBar(ab)

		supportActionBar?.setDisplayShowTitleEnabled(true)
		supportActionBar?.title = "???"


		page.setBackgroundColor(Color.MAGENTA)
		page.overflowEdge = LayoutBase.OverflowEdgeIgnore
//		page.setInsetListener {
//			val insets = it.asIntBuffer()
//			insets.put(0,0)
//			insets.put(1,0)
//			insets.put(2,0)
//			insets.put(3,0)
////			insets.put(3,0)
////			insets.put(5,1)
//		}

		frame.setBackgroundColor(Color.BLUE)
		frame.layoutParams = CommonLayoutParams(
			ViewGroup.LayoutParams(
				ViewGroup.LayoutParams.MATCH_PARENT,
				ViewGroup.LayoutParams.MATCH_PARENT
			)
		)

		val svp = StackLayout(this)
//		svp.setBackgroundColor(Color.YELLOW)
		val svParams = CommonLayoutParams(
			ViewGroup.LayoutParams(
				ViewGroup.LayoutParams.MATCH_PARENT,
				ViewGroup.LayoutParams.MATCH_PARENT
			)
		)
		svParams.row = 1
		svp.layoutParams = svParams
//		svp.setInsetListener {
//			val insets = it.asIntBuffer()
//			insets.put(0,0)
//			insets.put(1,0)
//			insets.put(2,0)
//			insets.put(3,0)
//			// insets.put(7, 1)
//		}

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
		params.row = 1
		params.width = 300
		params.height = 300
		params.width
		btn.layoutParams = params
		btn.setOnClickListener {
			/*
			val new_page = StackLayout(this)
			new_page.setBackgroundColor(Color.BLUE)
			new_page.layoutParams = CommonLayoutParams(
				ViewGroup.LayoutParams(
					300, 300
				)
			)
			container.addView(new_page)


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

			*/


			val frame = Frag()

			frame.show(supportFragmentManager, "test")


		}
		page.addView(btn)
		frame.addView(page)
		setContentView(frame)

		frame.postDelayed(3000) {
			page.overflowEdge = LayoutBase.OverflowEdgeNone
		}

	}
}

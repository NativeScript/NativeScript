package org.nativescript.widgetsdemo

import android.app.Dialog
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.util.TypedValue
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.core.graphics.drawable.toDrawable
import androidx.core.view.postDelayed
import androidx.fragment.app.DialogFragment
import androidx.work.WorkerParameters
import org.nativescript.widgets.AppWidgetManager
import org.nativescript.widgets.AppWidgetWorker
import org.nativescript.widgets.CommonLayoutParams
import org.nativescript.widgets.ContentLayout
import org.nativescript.widgets.GridLayout
import org.nativescript.widgets.GridUnitType
import org.nativescript.widgets.LayoutBase
import org.nativescript.widgets.RemoteViewsManager
import org.nativescript.widgets.StackLayout
import org.nativescript.widgets.Utils

class MainActivity : AppCompatActivity() {

	companion object {
		private const val TAG = "EdgeToEdgeDemo"
	}

	// Test 1: Dialog with OverflowEdgeNone + keyboard
	class FragEdgeNone : DialogFragment() {
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
			txt.text = "OverflowEdgeNone — tap the input and check bottom padding"

			val input = EditText(requireContext())
			input.hint = "Tap to open keyboard"
			input.setTextColor(Color.WHITE)

			content.addView(txt)
			content.addView(input)
			page.addView(content)

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

	// Test 2: Dialog with OverflowEdgeBottom + keyboard (the bug case)
	class FragEdgeBottom : DialogFragment() {
		override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
			val dialog = super.onCreateDialog(savedInstanceState)

			val page = StackLayout(requireContext())
			page.setBackgroundColor(Color.parseColor("#FF6600"))
			page.overflowEdge = LayoutBase.OverflowEdgeBottom

			val label = TextView(requireContext())
			label.text = "OverflowEdgeBottom — keyboard should NOT double the bottom padding"
			label.setTextColor(Color.WHITE)

			val input = EditText(requireContext())
			input.hint = "Tap to open keyboard"
			input.setTextColor(Color.WHITE)

			val bottomLabel = TextView(requireContext())
			bottomLabel.text = "This text should sit just above the keyboard, not have a big gap"
			bottomLabel.setTextColor(Color.WHITE)

			page.addView(label)
			page.addView(input)
			page.addView(bottomLabel)

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

	// Test 3: Dialog with nested layouts both applying bottom insets
	class FragNested : DialogFragment() {
		override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
			val dialog = super.onCreateDialog(savedInstanceState)

			val outer = StackLayout(requireContext())
			outer.setBackgroundColor(Color.parseColor("#880088"))
			// Parent applies bottom — does NOT consume it
			outer.overflowEdge = LayoutBase.OverflowEdgeBottom or LayoutBase.OverflowEdgeBottomDontConsume

			val inner = StackLayout(requireContext())
			inner.setBackgroundColor(Color.parseColor("#008888"))
			inner.layoutParams = CommonLayoutParams(
				ViewGroup.LayoutParams(
					ViewGroup.LayoutParams.MATCH_PARENT,
					ViewGroup.LayoutParams.MATCH_PARENT
				)
			)
			// Child also applies bottom — so insets could stack
			inner.overflowEdge = LayoutBase.OverflowEdgeBottom

			val label = TextView(requireContext())
			label.text = "Nested: outer + inner both apply bottom. Check for double padding."
			label.setTextColor(Color.WHITE)

			val input = EditText(requireContext())
			input.hint = "Tap to open keyboard"
			input.setTextColor(Color.WHITE)

			inner.addView(label)
			inner.addView(input)
			outer.addView(inner)

			dialog.setContentView(
				outer, ViewGroup.LayoutParams(
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

	// Test 4: Dialog testing setPadding after insets are applied
	class FragSetPaddingAfter : DialogFragment() {
		override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
			val dialog = super.onCreateDialog(savedInstanceState)

			val page = StackLayout(requireContext())
			page.setBackgroundColor(Color.parseColor("#006600"))
			page.overflowEdge = LayoutBase.OverflowEdgeNone

			val label = TextView(requireContext())
			label.text = "setPadding after insets — bottom should be user padding + inset, not doubled"
			label.setTextColor(Color.WHITE)

			val input = EditText(requireContext())
			input.hint = "Tap to open keyboard"
			input.setTextColor(Color.WHITE)

			val paddingBtn = Button(requireContext())
			paddingBtn.text = "Call setPadding(20,20,20,20)"
			paddingBtn.setOnClickListener {
				val dp20 = (20 * page.resources.displayMetrics.density).toInt()
				Log.d(TAG, "Before setPadding: paddingBottom=${page.paddingBottom}")
				page.setPadding(dp20, dp20, dp20, dp20)
				Log.d(TAG, "After setPadding: paddingBottom=${page.paddingBottom}")
				Log.d(TAG, "  edgeInsets.bottom=${page.edgeInsets.bottom}")
				Log.d(TAG, "  imeInsets.bottom=${page.imeInsets.bottom}")
			}

			page.addView(label)
			page.addView(input)
			page.addView(paddingBtn)

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

	// Test 5: Dialog cycling overflow modes while keyboard is open
	class FragCycleMode : DialogFragment() {
		override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
			val dialog = super.onCreateDialog(savedInstanceState)

			val page = StackLayout(requireContext())
			page.setBackgroundColor(Color.DKGRAY)
			page.overflowEdge = LayoutBase.OverflowEdgeNone

			val statusLabel = TextView(requireContext())
			statusLabel.text = "Mode: OverflowEdgeNone"
			statusLabel.setTextColor(Color.YELLOW)
			statusLabel.textSize = 18f

			val paddingLabel = TextView(requireContext())
			paddingLabel.text = "paddingBottom: ?"
			paddingLabel.setTextColor(Color.CYAN)
			paddingLabel.textSize = 14f

			val input = EditText(requireContext())
			input.hint = "Open keyboard FIRST, then cycle modes"
			input.setTextColor(Color.WHITE)

			val modes = listOf(
				"OverflowEdgeNone" to LayoutBase.OverflowEdgeNone,
				"OverflowEdgeBottom" to LayoutBase.OverflowEdgeBottom,
				"OverflowEdgeAllButTop" to LayoutBase.OverflowEdgeAllButTop,
				"OverflowEdgeDontApply" to LayoutBase.OverflowEdgeDontApply,
			)
			var modeIndex = 0

			val cycleBtn = Button(requireContext())
			cycleBtn.text = "Cycle Overflow Mode"
			cycleBtn.setOnClickListener {
				modeIndex = (modeIndex + 1) % modes.size
				val (name, mode) = modes[modeIndex]
				page.overflowEdge = mode
				statusLabel.text = "Mode: $name"
				page.postDelayed(100) {
					paddingLabel.text =
						"paddingBottom: ${page.paddingBottom}  (edge=${page.edgeInsets.bottom}, ime=${page.imeInsets.bottom})"
					Log.d(
						TAG,
						"Cycle -> $name: paddingBottom=${page.paddingBottom}, edge=${page.edgeInsets.bottom}, ime=${page.imeInsets.bottom}"
					)
				}
			}

			page.addView(statusLabel)
			page.addView(paddingLabel)
			page.addView(input)
			page.addView(cycleBtn)

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

	class Worker(context: Context, params: WorkerParameters) : AppWidgetWorker(context, params) {
		override fun doWork(): Result {
			val widget = org.nativescript.widgets.RemoteViews.LinearLayout()
			val btn = org.nativescript.widgets.RemoteViews.Button("button")
			widget.addView(btn)
			widget.setBackgroundColor(Color.RED)
			val img = org.nativescript.widgets.RemoteViews.ImageView()
			widget.addView(img)
			img.setImageUrl("https://picsum.photos/seed/${System.currentTimeMillis()}/200/300")

			for (id in widgetIds) {
				(widget.findViewById("button") as? org.nativescript.widgets.RemoteViews.Button)?.let {
					btn.setText("Nice View Widget $id")
				}
				val updated = widget.build(applicationContext.packageName)
				updateWidget(id, updated)

				widget.resolveRemoteResources()
				updateWidget(id, widget.build(applicationContext.packageName))
			}
			return Result.success()
		}
	}

	override fun onNewIntent(intent: Intent) {
		super.onNewIntent(intent)
		Log.d("com.test", "intent $intent")
	}

	override fun onCreate(savedInstanceState: Bundle?) {
		super.onCreate(savedInstanceState)

		AppWidgetManager.register(
			"org.nativescript.widgetsdemo.DemoWidgetProvider",
			object : AppWidgetManager.WidgetListener {
				override fun onUpdateAsync(
					context: Context,
					provider: String,
					appWidgetIds: IntArray,
					manager: RemoteViewsManager,
					widgetManager: android.appwidget.AppWidgetManager?
				) {
					//	AppWidgetWorker.enqueue<Worker>(context, provider, appWidgetIds)

					val widget = org.nativescript.widgets.RemoteViews.LinearLayout()
					val btn = org.nativescript.widgets.RemoteViews.Button("button")
					btn.setSize(
						40f,
						TypedValue.COMPLEX_UNIT_DIP,
						40f,
						TypedValue.COMPLEX_UNIT_DIP,
					)
					widget.addView(btn)
					widget.setBackgroundColor(Color.RED)
					val img = org.nativescript.widgets.RemoteViews.ImageView()
//					img.setImageResource(
//						R.drawable.ic_launcher_background
//					)
					widget.addView(img)
					for (id in appWidgetIds) {
						(widget.findViewById("button") as? org.nativescript.widgets.RemoteViews.Button)?.let {
							btn.setText("Nice View Widget $id")
							val intent = PendingIntent.getActivity(
								context,
								0,
								Intent(applicationContext, MainActivity::class.java),
								PendingIntent.FLAG_IMMUTABLE
							)
							btn.setOnClickPendingIntent(
								intent
							)
						}
						val updated = widget.build(applicationContext.packageName)
						widgetManager?.updateAppWidget(id, updated)

						img.setImageUrl("https://picsum.photos/seed/${System.currentTimeMillis()}_$id/200/300")

						widget.resolveRemoteResources()
						widgetManager?.updateAppWidget(id, widget.build(applicationContext.packageName))
					}
				}
			})

		Utils.enableEdgeToEdge(this)
		val frame = ContentLayout(this)

		frame.overflowEdge = LayoutBase.OverflowEdgeIgnore

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

		page.overflowEdge = LayoutBase.OverflowEdgeNone

		val buttonContainer = StackLayout(this)
		val btnContainerParams = CommonLayoutParams(
			ViewGroup.LayoutParams(
				ViewGroup.LayoutParams.MATCH_PARENT,
				ViewGroup.LayoutParams.WRAP_CONTENT
			)
		)
		btnContainerParams.row = 1
		buttonContainer.layoutParams = btnContainerParams

		val btnEdgeNone = Button(this).apply {
			this.text = "Test: EdgeNone + IME"
			setOnClickListener {
				FragEdgeNone().show(supportFragmentManager, "edge_none")
			}
		}

		val btnEdgeBottom = Button(this).apply {
			this.text = "Test: EdgeBottom + IME (bug)"
			setOnClickListener {
				FragEdgeBottom().show(supportFragmentManager, "edge_bottom")
			}
		}

		val btnNested = Button(this).apply {
			this.text = "Test: Nested insets"
			setOnClickListener {
				FragNested().show(supportFragmentManager, "nested")
			}
		}

		val btnSetPadding = Button(this).apply {
			this.text = "Test: setPadding after insets"
			setOnClickListener {
				FragSetPaddingAfter().show(supportFragmentManager, "set_padding")
			}
		}

		val btnCycle = Button(this).apply {
			this.text = "Test: Cycle modes + IME"
			setOnClickListener {
				FragCycleMode().show(supportFragmentManager, "cycle")
			}
		}

		buttonContainer.addView(btnEdgeNone)
		buttonContainer.addView(btnEdgeBottom)
		buttonContainer.addView(btnNested)
		buttonContainer.addView(btnSetPadding)
		buttonContainer.addView(btnCycle)

		page.addView(buttonContainer)
		frame.addView(page)
		setContentView(frame)
	}
}

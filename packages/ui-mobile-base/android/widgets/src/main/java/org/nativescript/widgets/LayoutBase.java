package org.nativescript.widgets;

import android.content.Context;
import android.util.AttributeSet;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;

/**
 * @author hhristov
 */
public abstract class LayoutBase extends ViewGroup {
	private boolean passThroughParent;
	boolean applyingEdges;

	public static final int OverflowEdgeIgnore = -1;
	public static final int OverflowEdgeNone = 0;
	public static final int OverflowEdgeLeft = 1 << 1;
	public static final int OverflowEdgeTop = 1 << 2;
	public static final int OverflowEdgeRight = 1 << 3;
	public static final int OverflowEdgeBottom = 1 << 4;
	public static final int OverflowEdgeDontApply = 1 << 5;
	public static final int OverflowEdgeLeftDontConsume = 1 << 6;
	public static final int OverflowEdgeTopDontConsume = 1 << 7;
	public static final int OverflowEdgeRightDontConsume = 1 << 8;
	public static final int OverflowEdgeBottomDontConsume = 1 << 9;
	public static final int OverflowEdgeAllButLeft = 1 << 10;
	public static final int OverflowEdgeAllButTop = 1 << 11;
	public static final int OverflowEdgeAllButRight = 1 << 12;
	public static final int OverflowEdgeAllButBottom = 1 << 13;

	// Layout (bytes):
	// 0  - left inset (int)
	// 4  - top inset
	// 8  - right inset
	// 12 - bottom inset
	// 16 - left consumed (0/1)
	// 20 - top consumed
	// 24 - right consumed
	// 28 - bottom consumed

	public static final class BufferOffset {
		public static final int INSET_LEFT = 0;
		public static final int INSET_TOP = 4;
		public static final int INSET_RIGHT = 8;
		public static final int INSET_BOTTOM = 12;

		public static final int INSET_LEFT_CONSUMED = 16;
		public static final int INSET_TOP_CONSUMED = 20;
		public static final int INSET_RIGHT_CONSUMED = 24;
		public static final int INSET_BOTTOM_CONSUMED = 28;
	}

	int mPaddingLeft = 0;
	int mPaddingTop = 0;
	int mPaddingRight = 0;
	int mPaddingBottom = 0;

	Insets edgeInsets = Insets.NONE;

	int overflowEdge = OverflowEdgeIgnore;

	private final ByteBuffer insetBuffer = ByteBuffer.allocateDirect(32);

	private WindowInsetListener insetListener = null;
	private androidx.core.view.OnApplyWindowInsetsListener windowInsetsListener = null;

	public void setInsetListener(@Nullable WindowInsetListener insetListener) {
		this.insetListener = insetListener;
	}

	public interface WindowInsetListener {
		void onApplyWindowInsets(ByteBuffer inset);
	}

	private static final byte[] EMPTY_INSETS = new byte[32];


	private boolean pendingInsetApply = false;
	private final OnAttachStateChangeListener onAttachStateChangeListener = new OnAttachStateChangeListener() {
		@Override
		public void onViewAttachedToWindow(@NonNull View v) {
			if (pendingInsetApply) {
				pendingInsetApply = false;
				removeOnAttachStateChangeListener(onAttachStateChangeListener);
				ViewCompat.requestApplyInsets(v);
			}
		}

		@Override
		public void onViewDetachedFromWindow(@NonNull View v) {
		}
	};

	public LayoutBase(Context context, AttributeSet attrs, int defStyleAttr) {
		super(context, attrs, defStyleAttr);
		insetBuffer.order(ByteOrder.nativeOrder());
	}

	public LayoutBase(Context context) {
		super(context);
	}

	public Insets getEdgeInsets() {
		return edgeInsets;
	}

	@Override
	protected LayoutParams generateDefaultLayoutParams() {
		return new CommonLayoutParams();
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public LayoutParams generateLayoutParams(AttributeSet attrs) {
		return new CommonLayoutParams();
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	protected boolean checkLayoutParams(LayoutParams p) {
		return p instanceof CommonLayoutParams;
	}

	@Override
	protected ViewGroup.LayoutParams generateLayoutParams(ViewGroup.LayoutParams from) {
		if (from instanceof CommonLayoutParams)
			return new CommonLayoutParams((CommonLayoutParams) from);

		if (from instanceof FrameLayout.LayoutParams)
			return new CommonLayoutParams((FrameLayout.LayoutParams) from);

		if (from instanceof ViewGroup.MarginLayoutParams)
			return new CommonLayoutParams((ViewGroup.MarginLayoutParams) from);

		return new CommonLayoutParams(from);
	}

	@Override
	public boolean shouldDelayChildPressedState() {
		return false;
	}

	@Override
	public boolean onTouchEvent(MotionEvent event) {
		if (!this.passThroughParent) {
			return super.onTouchEvent(event);
		}

		// LayoutBase.onTouchEvent(ev) execution means no interactive child view handled
		// the event so we let the event pass through to parent view of the layout container
		// because passThroughParent is set to true
		return false;
	}

	protected static int getGravity(View view) {
		int gravity = -1;
		LayoutParams params = view.getLayoutParams();
		if (params instanceof FrameLayout.LayoutParams) {
			gravity = ((FrameLayout.LayoutParams) params).gravity;
		}

		if (gravity == -1) {
			gravity = Gravity.FILL;
		}

		return gravity;
	}

	public boolean getPassThroughParent() {
		return this.passThroughParent;
	}

	public void setPassThroughParent(boolean value) {
		this.passThroughParent = value;
	}

	@Override
	public void setPadding(int left, int top, int right, int bottom) {
		if (!applyingEdges) {
			mPaddingLeft = left;
			mPaddingTop = top;
			mPaddingRight = right;
			mPaddingBottom = bottom;
		}
		super.setPadding(left, top, right, bottom);
	}

	private void putInset(int offset, int value) {
		insetBuffer.putInt(offset, value);
	}

	private int getInset(int offset) {
		return insetBuffer.getInt(offset);
	}

	private void resetInset() {
		insetBuffer.position(0);
		insetBuffer.put(EMPTY_INSETS, 0, 32);
	}

	public void setOverflowEdge(int value) {
		overflowEdge = value;

		if (value == OverflowEdgeIgnore) {
			ViewCompat.setOnApplyWindowInsetsListener(this, null);
			ViewCompat.requestApplyInsets(this);
			return;
		}

		if (windowInsetsListener == null) {
			windowInsetsListener = new androidx.core.view.OnApplyWindowInsetsListener() {
				@NonNull
				@Override
				public WindowInsetsCompat onApplyWindowInsets(@NonNull View v, @NonNull WindowInsetsCompat insets) {
					if (insets.isConsumed() || overflowEdge == OverflowEdgeIgnore) {
						return insets;
					}

					if (!(v instanceof LayoutBase)) return insets;
					LayoutBase base = (LayoutBase) v;

					Insets statusBar = insets.getInsets(WindowInsetsCompat.Type.statusBars());
					Insets navBar = insets.getInsets(WindowInsetsCompat.Type.navigationBars());
					Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());

					int insetLeft = navBar.left;
					int insetRight = navBar.right;
					int insetBottom = Math.max(navBar.bottom, ime.bottom);

					resetInset();

					WindowInsetsCompat consumed = new WindowInsetsCompat.Builder()
						.setInsets(WindowInsetsCompat.Type.systemBars(), Insets.NONE).build();

					if (overflowEdge == OverflowEdgeNone) {
						base.applyingEdges = true;
						v.setPadding(mPaddingLeft + insetLeft, mPaddingTop + statusBar.top,
							mPaddingRight + insetRight, mPaddingBottom + insetBottom);
						edgeInsets = Insets.of(insetLeft, statusBar.top, insetRight, insetBottom);
						base.applyingEdges = false;
						return consumed;
					}

					boolean[] consumeFlags = new boolean[4];
					boolean[] applyFlags = new boolean[4];

					consumeFlags[0] = (overflowEdge & OverflowEdgeLeft) == OverflowEdgeLeft;
					consumeFlags[1] = (overflowEdge & OverflowEdgeTop) == OverflowEdgeTop;
					consumeFlags[2] = (overflowEdge & OverflowEdgeRight) == OverflowEdgeRight;
					consumeFlags[3] = (overflowEdge & OverflowEdgeBottom) == OverflowEdgeBottom;

					applyFlags[0] = (overflowEdge & OverflowEdgeLeftDontConsume) == OverflowEdgeLeftDontConsume;
					applyFlags[1] = (overflowEdge & OverflowEdgeTopDontConsume) == OverflowEdgeTopDontConsume;
					applyFlags[2] = (overflowEdge & OverflowEdgeRightDontConsume) == OverflowEdgeRightDontConsume;
					applyFlags[3] = (overflowEdge & OverflowEdgeBottomDontConsume) == OverflowEdgeBottomDontConsume;

					if ((overflowEdge & OverflowEdgeAllButLeft) == OverflowEdgeAllButLeft) { consumeFlags[0] = applyFlags[0] = false; for(int i=1;i<4;i++){ consumeFlags[i]=applyFlags[i]=true; } }
					if ((overflowEdge & OverflowEdgeAllButTop) == OverflowEdgeAllButTop)   { consumeFlags[1] = applyFlags[1] = false; for(int i=0;i<4;i++){ if(i!=1){ consumeFlags[i]=applyFlags[i]=true; } } }
					if ((overflowEdge & OverflowEdgeAllButRight) == OverflowEdgeAllButRight) { consumeFlags[2] = applyFlags[2] = false; for(int i=0;i<4;i++){ if(i!=2){ consumeFlags[i]=applyFlags[i]=true; } } }
					if ((overflowEdge & OverflowEdgeAllButBottom) == OverflowEdgeAllButBottom) { consumeFlags[3] = applyFlags[3] = false; for(int i=0;i<4;i++){ if(i!=3){ consumeFlags[i]=applyFlags[i]=true; } } }

					int left = consumeFlags[0] ? 0 : mPaddingLeft + insetLeft;
					int top = consumeFlags[1] ? 0 : mPaddingTop + statusBar.top;
					int right = consumeFlags[2] ? 0 : mPaddingRight + insetRight;
					int bottom = consumeFlags[3] ? 0 : mPaddingBottom + insetBottom;

					edgeInsets = Insets.of(left, top, right, bottom);
					base.applyingEdges = true;
					base.setPadding(left, top, right, bottom);
					base.applyingEdges = false;


					Insets returnInsets = Insets.of(
						consumeFlags[0] ? 0 : insetLeft,
						consumeFlags[1] ? 0 : statusBar.top,
						consumeFlags[2] ? 0 : insetRight,
						consumeFlags[3] ? 0 : insetBottom
					);

					return new WindowInsetsCompat.Builder()
						.setInsets(WindowInsetsCompat.Type.systemBars(), returnInsets)
						.build();
				}
			};
			ViewCompat.setOnApplyWindowInsetsListener(this, windowInsetsListener);
		}

		if (!pendingInsetApply) {
			if (isAttachedToWindow()) {
				ViewCompat.requestApplyInsets(this);
			} else {
				pendingInsetApply = true;
				addOnAttachStateChangeListener(onAttachStateChangeListener);
			}
		}
	}

	public int getOverflowEdge() {
		return overflowEdge;
	}
}

package org.nativescript.widgets;

import android.content.Context;
import android.util.AttributeSet;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
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
	// 32 - bottom ime inset
	// 16 - left consumed (0/1)
	// 20 - top consumed
	// 24 - right consumed
	// 28 - bottom consumed
	// 36 - bottom ime consumed

	public static final class BufferOffset {
		public static final int INSET_LEFT = 0;
		public static final int INSET_TOP = 4;
		public static final int INSET_RIGHT = 8;
		public static final int INSET_BOTTOM = 12;
		public static final int INSET_BOTTOM_IME = 32;

		public static final int INSET_LEFT_CONSUMED = 16;
		public static final int INSET_TOP_CONSUMED = 20;
		public static final int INSET_RIGHT_CONSUMED = 24;
		public static final int INSET_BOTTOM_CONSUMED = 28;
		public static final int INSET_BOTTOM_IME_CONSUMED = 36;
	}

	int mPaddingLeft = 0;
	int mPaddingTop = 0;
	int mPaddingRight = 0;
	int mPaddingBottom = 0;

	Insets edgeInsets = Insets.NONE;
	Insets appliedInsets = Insets.NONE;
	Insets imeInsets = Insets.NONE;


	int overflowEdge = OverflowEdgeIgnore;

	private final ByteBuffer insetBuffer = ByteBuffer.allocateDirect(40);

	private WindowInsetListener insetListener = null;
	private androidx.core.view.OnApplyWindowInsetsListener windowInsetsListener = null;

	public void setInsetListener(@Nullable WindowInsetListener insetListener) {
		this.insetListener = insetListener;
	}

	public interface WindowInsetListener {
		void onApplyWindowInsets(ByteBuffer inset);
	}

	private static final byte[] EMPTY_INSETS = new byte[40];


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

	public Insets getImeInsets() {
		return imeInsets;
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
		int appliedLeft = left;
		int appliedTop = top;
		int appliedRight = right;
		int appliedBottom = bottom;

		if (!applyingEdges) {
			mPaddingLeft = left;
			mPaddingTop = top;
			mPaddingRight = right;
			mPaddingBottom = bottom;
			appliedLeft += edgeInsets.left;
			appliedTop += edgeInsets.top;
			appliedRight += edgeInsets.right;
			appliedBottom += edgeInsets.bottom;
		}
		super.setPadding(appliedLeft, appliedTop, appliedRight, appliedBottom);
	}

	private void putInset(int offset, int value) {
		insetBuffer.putInt(offset, value);
	}

	private int getInset(int offset) {
		return insetBuffer.getInt(offset);
	}

	private void resetInset() {
		insetBuffer.position(0);
		insetBuffer.put(EMPTY_INSETS, 0, 40);
	}

	public void setOverflowEdge(int value) {
		overflowEdge = value;

		if (windowInsetsListener == null) {
			windowInsetsListener = new androidx.core.view.OnApplyWindowInsetsListener() {
				@NonNull
				@Override
				public WindowInsetsCompat onApplyWindowInsets(
					@NonNull View v,
					@NonNull WindowInsetsCompat insets
				) {
					if (insets.isConsumed() || overflowEdge == OverflowEdgeIgnore) {
						return insets;
					}

					if (!(v instanceof LayoutBase)) return insets;
					LayoutBase base = (LayoutBase) v;

					Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
					Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());

					if (systemBars == Insets.NONE && ime == Insets.NONE) {
						return WindowInsetsCompat.CONSUMED;
					}

					int insetLeft = systemBars.left;
					int insetRight = systemBars.right;
					int insetTop = systemBars.top;
					int insetNavBottom = systemBars.bottom;
					int insetImeBottom = ime.bottom;

					if (overflowEdge == OverflowEdgeNone) {
						int bottom = mPaddingBottom + Math.max(insetNavBottom, insetImeBottom);

						base.applyingEdges = true;
						v.setPadding(
							mPaddingLeft + insetLeft,
							mPaddingTop + insetTop,
							mPaddingRight + insetRight,
							bottom
						);
						base.applyingEdges = false;

						edgeInsets = Insets.of(insetLeft, insetTop, insetRight, insetNavBottom);
						imeInsets = Insets.of(0, 0, 0, insetImeBottom);

						return new WindowInsetsCompat.Builder(insets)
							.setInsets(WindowInsetsCompat.Type.systemBars(), Insets.NONE)
							.setInsets(WindowInsetsCompat.Type.ime(), Insets.NONE)
							.build();
					}

					boolean[] apply = new boolean[4];   // L T R B
					boolean[] consume = new boolean[4];
					boolean[] defaultConsume = new boolean[4];
					defaultConsume[0] = defaultConsume[1] = defaultConsume[2] = defaultConsume[3] = true;

					consume[0] = (overflowEdge & OverflowEdgeLeft) != 0;
					consume[1] = (overflowEdge & OverflowEdgeTop) != 0;
					consume[2] = (overflowEdge & OverflowEdgeRight) != 0;
					consume[3] = (overflowEdge & OverflowEdgeBottom) != 0;

					if ((overflowEdge & OverflowEdgeLeftDontConsume) != 0)
						defaultConsume[0] = consume[0] = false;
					if ((overflowEdge & OverflowEdgeTopDontConsume) != 0)
						defaultConsume[1] = consume[1] = false;
					if ((overflowEdge & OverflowEdgeRightDontConsume) != 0)
						defaultConsume[2] = consume[2] = false;
					if ((overflowEdge & OverflowEdgeBottomDontConsume) != 0)
						defaultConsume[3] = consume[3] = false;

					apply[0] = !consume[0];
					apply[1] = !consume[1];
					apply[2] = !consume[2];
					apply[3] = !consume[3];

					if ((overflowEdge & OverflowEdgeAllButLeft) != 0) {
						for (int i = 0; i < 4; i++) {
							consume[i] = true;
							apply[i] = false;
						}
						defaultConsume[0] = consume[0] = false;
						apply[0] = true;
					}

					if ((overflowEdge & OverflowEdgeAllButTop) != 0) {
						for (int i = 0; i < 4; i++) {
							consume[i] = true;
							apply[i] = false;
						}
						defaultConsume[1] = consume[1] = false;
						apply[1] = true;
					}

					if ((overflowEdge & OverflowEdgeAllButRight) != 0) {
						for (int i = 0; i < 4; i++) {
							consume[i] = true;
							apply[i] = false;
						}
						defaultConsume[2] = consume[2] = false;
						apply[2] = true;
					}

					if ((overflowEdge & OverflowEdgeAllButBottom) != 0) {
						for (int i = 0; i < 4; i++) {
							consume[i] = true;
							apply[i] = false;
						}
						defaultConsume[3] = consume[3] = false;
						apply[3] = true;
					}

					boolean consumeIme = consume[3];

					if (overflowEdge == OverflowEdgeDontApply) {
						resetInset();

						putInset(BufferOffset.INSET_LEFT, insetLeft);
						putInset(BufferOffset.INSET_TOP, insetTop);
						putInset(BufferOffset.INSET_RIGHT, insetRight);
						putInset(BufferOffset.INSET_BOTTOM, insetNavBottom);
						putInset(BufferOffset.INSET_BOTTOM_IME, insetImeBottom);

						putInset(BufferOffset.INSET_LEFT_CONSUMED, 0);
						putInset(BufferOffset.INSET_TOP_CONSUMED, 0);
						putInset(BufferOffset.INSET_RIGHT_CONSUMED, 0);
						putInset(BufferOffset.INSET_BOTTOM_CONSUMED, 0);
						putInset(BufferOffset.INSET_BOTTOM_IME_CONSUMED, 0);

						if (base.insetListener != null) {
							base.insetListener.onApplyWindowInsets(insetBuffer);
						}

						defaultConsume[0] = defaultConsume[1] = defaultConsume[2] = defaultConsume[3] = false;

						consume[0] |= getInset(BufferOffset.INSET_LEFT_CONSUMED) != 0;
						consume[1] |= getInset(BufferOffset.INSET_TOP_CONSUMED) != 0;
						consume[2] |= getInset(BufferOffset.INSET_RIGHT_CONSUMED) != 0;
						consume[3] |= getInset(BufferOffset.INSET_BOTTOM_CONSUMED) != 0;
						consumeIme |= getInset(BufferOffset.INSET_BOTTOM_IME_CONSUMED) != 0;

						insetLeft = getInset(BufferOffset.INSET_LEFT);
						insetTop = getInset(BufferOffset.INSET_TOP);
						insetRight = getInset(BufferOffset.INSET_RIGHT);
						insetNavBottom = getInset(BufferOffset.INSET_BOTTOM);
						insetImeBottom = getInset(BufferOffset.INSET_BOTTOM_IME);

						defaultConsume[0] = consume[0];

						defaultConsume[1] = consume[1];

						defaultConsume[2] = consume[2];

						defaultConsume[3] = consume[3];

						apply[0] = apply[1] = apply[2] = apply[3] = false;
					}

					int left = mPaddingLeft + (apply[0] ? insetLeft : 0);
					int top = mPaddingTop + (apply[1] ? insetTop : 0);
					int right = mPaddingRight + (apply[2] ? insetRight : 0);
					int bottom = mPaddingBottom
						+ (apply[3] ? insetNavBottom : 0)
						+ (apply[3] ? insetImeBottom : 0);

					edgeInsets = Insets.of(
						apply[0] ? insetLeft : 0,
						apply[1] ? insetTop : 0,
						apply[2] ? insetRight : 0,
						apply[3] ? insetNavBottom : 0
					);

					imeInsets = apply[3]
						? Insets.of(0, 0, 0, insetImeBottom)
						: Insets.NONE;

					base.applyingEdges = true;
					base.setPadding(left, top, right, bottom);
					base.applyingEdges = false;

					Insets remainingSystemBars = Insets.of(
						defaultConsume[0] ? 0 : insetLeft,
						defaultConsume[1] ? 0 : insetTop,
						defaultConsume[2] ? 0 : insetRight,
						defaultConsume[3] ? 0 : insetNavBottom
					);

					Insets remainingIme =
						consumeIme ? Insets.NONE
							: Insets.of(0, 0, 0, insetImeBottom);

					return new WindowInsetsCompat.Builder(insets)
						.setInsets(WindowInsetsCompat.Type.systemBars(), remainingSystemBars)
						.setInsets(WindowInsetsCompat.Type.ime(), remainingIme)
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

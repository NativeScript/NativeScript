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
import java.nio.IntBuffer;

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

	@Override
	public WindowInsets onApplyWindowInsets(WindowInsets insets) {
		return super.onApplyWindowInsets(insets);
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

	public void setOverflowEdge(int value) {
		overflowEdge = value;

		if (value == OverflowEdgeIgnore) {
			ViewCompat.setOnApplyWindowInsetsListener(this, null);
			ViewCompat.requestApplyInsets(this);
		} else if (windowInsetsListener == null) {
			// if incoming inset is empty and previous inset is empty return consumed
			// an incoming empty inset is one way to detect a consumed inset e.g multiple views consumed top/bottom
			windowInsetsListener = new androidx.core.view.OnApplyWindowInsetsListener() {
				@NonNull
				@Override
				public WindowInsetsCompat onApplyWindowInsets(@NonNull View v, @NonNull WindowInsetsCompat insets) {
					if (insets.isConsumed()) {
						return insets;
					}
					if (v instanceof LayoutBase) {
						LayoutBase base = (LayoutBase) v;

						// should not occur but if it does return the inset
						if (overflowEdge == OverflowEdgeIgnore) {
							return insets;
						}

						Insets statusBar = insets.getInsets(WindowInsetsCompat.Type.statusBars());
						Insets navBar = insets.getInsets(WindowInsetsCompat.Type.navigationBars());
						Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());

						int insetLeft = navBar.left;
						int insetRight = navBar.right;
						int insetBottom = Math.max(navBar.bottom, ime.bottom);

						insetBuffer.put(EMPTY_INSETS, 0, 32);
						insetBuffer.rewind();

						if (overflowEdge == OverflowEdgeNone) {
							base.applyingEdges = true;
							v.setPadding(mPaddingLeft + insetLeft, mPaddingTop + statusBar.top, mPaddingRight + insetRight, mPaddingBottom + insetBottom);
							edgeInsets = Insets.of(insetLeft, statusBar.top, insetRight, insetBottom);
							base.applyingEdges = false;
							return WindowInsetsCompat.CONSUMED;
						}

						if (base.insetListener != null) {
							if (overflowEdge == OverflowEdgeDontApply) {
								// if incoming inset is empty and previous inset is empty return consumed
								// an incoming empty inset is one way to detect a consumed inset e.g multiple views consumed top/bottom
								if (Insets.NONE.equals(statusBar) && Insets.NONE.equals(navBar) && Insets.NONE.equals(ime) && Insets.NONE.equals(edgeInsets)) {
									return WindowInsetsCompat.CONSUMED;
								}

								IntBuffer insetData = insetBuffer.asIntBuffer();

								boolean leftPreviouslyConsumed = insetLeft == 0;
								boolean topPreviouslyConsumed = statusBar.top == 0;
								boolean rightPreviouslyConsumed = insetRight == 0;
								boolean bottomPreviouslyConsumed = insetBottom == 0;


								insetData.put(0, insetLeft).put(1, statusBar.top).put(2, insetRight).put(3, insetBottom).put(4, leftPreviouslyConsumed ? 1 : 0).put(5, topPreviouslyConsumed ? 1 : 0).put(6, rightPreviouslyConsumed ? 1 : 0).put(7, bottomPreviouslyConsumed ? 1 : 0);

								base.insetListener.onApplyWindowInsets(insetBuffer);

								int leftInset = insetData.get(0);
								int topInset = insetData.get(1);
								int rightInset = insetData.get(2);
								int bottomInset = insetData.get(3);

								boolean leftConsumed = insetData.get(4) > 0;
								boolean topConsumed = insetData.get(5) > 0;
								boolean rightConsumed = insetData.get(6) > 0;
								boolean bottomConsumed = insetData.get(7) > 0;

								if (leftConsumed && topConsumed && rightConsumed && bottomConsumed) {
									edgeInsets = Insets.of(leftInset, topInset, rightInset, bottomInset);
									base.setPadding(leftInset, topInset, rightInset, bottomInset);
									return new WindowInsetsCompat.Builder().setInsets(WindowInsetsCompat.Type.systemBars(), Insets.NONE).build();
								}

								base.setPadding(leftPreviouslyConsumed ? 0 : leftInset, topPreviouslyConsumed ? 0 : topInset, rightPreviouslyConsumed ? 0 : rightInset, bottomPreviouslyConsumed ? 0 : bottomInset);

								// restore inset edge if not consumed

								if (!(leftPreviouslyConsumed || leftConsumed)) {
									leftInset = insetLeft;
								}

								if (!(topPreviouslyConsumed || topConsumed)) {
									topInset = statusBar.top;
								}

								if (!(rightPreviouslyConsumed || rightConsumed)) {
									rightInset = insetRight;
								}

								if (!(bottomPreviouslyConsumed || bottomConsumed)) {
									bottomInset = insetBottom;
								}

								edgeInsets = Insets.of(leftPreviouslyConsumed ? 0 : leftInset, topPreviouslyConsumed ? 0 : topInset, rightPreviouslyConsumed ? 0 : rightInset, bottomPreviouslyConsumed ? 0 : bottomInset);

								return new WindowInsetsCompat.Builder().setInsets(WindowInsetsCompat.Type.systemBars(), Insets.of(leftPreviouslyConsumed || leftConsumed ? 0 : leftInset, topPreviouslyConsumed || topConsumed ? 0 : topInset, rightPreviouslyConsumed || rightConsumed ? 0 : rightInset, bottomPreviouslyConsumed || bottomConsumed ? 0 : bottomInset)).build();
							}
						}

						boolean overflowLeftConsume = (overflowEdge & OverflowEdgeLeft) == OverflowEdgeLeft;
						boolean overflowTopConsume = (overflowEdge & OverflowEdgeTop) == OverflowEdgeTop;
						boolean overflowRightConsume = (overflowEdge & OverflowEdgeRight) == OverflowEdgeRight;
						boolean overflowBottomConsume = (overflowEdge & OverflowEdgeBottom) == OverflowEdgeBottom;

						boolean overflowLeft = (overflowEdge & OverflowEdgeLeftDontConsume) == OverflowEdgeLeftDontConsume;
						boolean overflowTop = (overflowEdge & OverflowEdgeTopDontConsume) == OverflowEdgeTopDontConsume;
						boolean overflowRight = (overflowEdge & OverflowEdgeRightDontConsume) == OverflowEdgeRightDontConsume;
						boolean overflowBottom = (overflowEdge & OverflowEdgeBottomDontConsume) == OverflowEdgeBottomDontConsume;


						boolean overflowAllButLeft = (overflowEdge & OverflowEdgeAllButLeft) == OverflowEdgeAllButLeft;
						boolean overflowAllButTop = (overflowEdge & OverflowEdgeAllButTop) == OverflowEdgeAllButTop;
						boolean overflowAllButRight = (overflowEdge & OverflowEdgeAllButRight) == OverflowEdgeAllButRight;
						boolean overflowAllButBottom = (overflowEdge & OverflowEdgeAllButBottom) == OverflowEdgeAllButBottom;


						WindowInsetsCompat ret = insets;
						base.applyingEdges = true;
						int left = 0;
						int top = 0;
						int right = 0;
						int bottom = 0;


						if (overflowAllButLeft || overflowAllButTop || overflowAllButRight || overflowAllButBottom) {
							Insets newInset;
							if (overflowAllButLeft) {
								left = mPaddingLeft + insetLeft;
								edgeInsets = Insets.of(insetLeft, 0, 0, 0);
								newInset = Insets.of(0, statusBar.top, insetRight, insetBottom);
							} else if (overflowAllButTop) {
								top = mPaddingTop + statusBar.top;
								edgeInsets = Insets.of(0, statusBar.top, 0, 0);
								newInset = Insets.of(insetLeft, 0, insetRight, insetBottom);
							} else if (overflowAllButRight) {
								right = mPaddingRight + insetRight;
								edgeInsets = Insets.of(0, 0, insetRight, 0);
								newInset = Insets.of(insetLeft, statusBar.top, 0, insetBottom);
							} else {
								bottom = mPaddingBottom + insetBottom;
								edgeInsets = Insets.of(0, 0, 0, insetBottom);
								newInset = Insets.of(insetLeft, statusBar.top, insetRight, 0);
							}

							ret = new WindowInsetsCompat.Builder().setInsets(WindowInsetsCompat.Type.systemBars(), newInset).build();
							base.setPadding(left, top, right, bottom);
							base.applyingEdges = false;
							if (newInset == Insets.NONE) {
								return WindowInsetsCompat.CONSUMED;
							}
							return ret;
						}

						if (overflowLeftConsume || overflowLeft) {
							top = mPaddingTop + statusBar.top;
							right = mPaddingRight + insetRight;
							bottom = mPaddingBottom + insetBottom;
							edgeInsets = Insets.of(insetLeft, statusBar.top, insetRight, insetBottom);
							if (overflowRightConsume) {
								ret = WindowInsetsCompat.CONSUMED;
							}
						}
						if (overflowTopConsume || overflowTop) {
							left = mPaddingLeft + insetLeft;
							right = mPaddingRight + insetRight;
							bottom = mPaddingBottom + insetBottom;
							edgeInsets = Insets.of(insetLeft, statusBar.top, insetRight, insetBottom);
							if (overflowTopConsume) {
								ret = WindowInsetsCompat.CONSUMED;
							}
						}
						if (overflowRightConsume || overflowRight) {
							left = mPaddingLeft + insetLeft;
							top = mPaddingTop + statusBar.top;
							bottom = mPaddingBottom + insetBottom;
							edgeInsets = Insets.of(insetLeft, statusBar.top, insetRight, insetBottom);
							if (overflowRightConsume) {
								ret = WindowInsetsCompat.CONSUMED;
							}
						}
						if (overflowBottomConsume || overflowBottom) {
							left = mPaddingLeft + insetLeft;
							top = mPaddingTop + statusBar.top;
							right = mPaddingRight + insetRight;
							edgeInsets = Insets.of(insetLeft, statusBar.top, insetRight, insetBottom);
							if (overflowBottomConsume) {
								ret = WindowInsetsCompat.CONSUMED;
							}
						}

						base.setPadding(left, top, right, bottom);

						base.applyingEdges = false;
						return ret;
					}
					return insets;
				}
			};
			ViewCompat.setOnApplyWindowInsetsListener(this, windowInsetsListener);
		}

		if (pendingInsetApply) {
			return;
		}
		if (isAttachedToWindow()) {
			ViewCompat.requestApplyInsets(this);
		} else {
			pendingInsetApply = true;
			addOnAttachStateChangeListener(onAttachStateChangeListener);
		}
	}

	public int getOverflowEdge() {
		return overflowEdge;
	}
}
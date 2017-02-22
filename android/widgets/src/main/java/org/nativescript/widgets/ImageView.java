/**
 *
 */
package org.nativescript.widgets;

import android.content.Context;
import android.graphics.*;
import android.graphics.drawable.Drawable;

import org.nativescript.widgets.image.Fetcher;
import org.nativescript.widgets.image.Worker;

/**
 * @author hhristov
 */
public class ImageView extends android.widget.ImageView {
    private static final double EPSILON = 1E-05;

    private Path path = new Path();
    private RectF rect = new RectF();

    private double scaleW = 1;
    private double scaleH = 1;

    private float rotationAngle;

    private Matrix mMatrix;
    private Bitmap mBitmap;
    private String mUri;
    private int mDecodeWidth;
    private int mDecodeHeight;
    private boolean mUseCache;
    private boolean mAsync;
    private Worker.OnImageLoadedListener mListener;
    private boolean mAttachedToWindow = false;

    public float getRotationAngle() {
        return rotationAngle;
    }

    public void setRotationAngle(float rotationAngle) {
        this.rotationAngle = rotationAngle;
        invalidate();
    }

    public ImageView(Context context) {
        super(context);
        this.mMatrix = new Matrix();
        this.setScaleType(ScaleType.FIT_CENTER);
    }

    @Override
    protected void onAttachedToWindow() {
        mAttachedToWindow = true;
        super.onAttachedToWindow();
        this.loadImage();
    }

    @Override
    protected void onDetachedFromWindow() {
        mAttachedToWindow = false;
        super.onDetachedFromWindow();
        if (mUri != null) {
            // Clear the bitmap as we are not in the visual tree.
            this.setImageBitmap(null);
        }
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {

        int width = MeasureSpec.getSize(widthMeasureSpec);
        int widthMode = MeasureSpec.getMode(widthMeasureSpec);

        int height = MeasureSpec.getSize(heightMeasureSpec);
        int heightMode = MeasureSpec.getMode(heightMeasureSpec);

        Drawable drawable = this.getDrawable();
        int measureWidth;
        int measureHeight;
        if (drawable != null) {
            measureWidth = drawable.getIntrinsicWidth();
            measureHeight = drawable.getIntrinsicHeight();
        } else {
            measureWidth = 0;
            measureHeight = 0;
        }

        boolean finiteWidth = widthMode != MeasureSpec.UNSPECIFIED;
        boolean finiteHeight = heightMode != MeasureSpec.UNSPECIFIED;

        if (measureWidth != 0 && measureHeight != 0 && (finiteWidth || finiteHeight)) {
            this.computeScaleFactor(width, height, finiteWidth, finiteHeight, measureWidth, measureHeight);
            int resultW = (int) Math.round(measureWidth * this.scaleW);
            int resultH = (int) Math.round(measureHeight * this.scaleH);

            measureWidth = finiteWidth ? Math.min(resultW, width) : resultW;
            measureHeight = finiteHeight ? Math.min(resultH, height) : resultH;
        }

        measureWidth += this.getPaddingLeft() + this.getPaddingRight();
        measureHeight += this.getPaddingTop() + this.getPaddingBottom();

        measureWidth = Math.max(measureWidth, getSuggestedMinimumWidth());
        measureHeight = Math.max(measureHeight, getSuggestedMinimumHeight());

        if (CommonLayoutParams.debuggable > 0) {
            StringBuilder sb = CommonLayoutParams.getStringBuilder();
            sb.append("ImageView onMeasure: ");
            sb.append(MeasureSpec.toString(widthMeasureSpec));
            sb.append(", ");
            sb.append(MeasureSpec.toString(heightMeasureSpec));
            sb.append(", stretch: ");
            sb.append(this.getScaleType());
            sb.append(", measureWidth: ");
            sb.append(measureWidth);
            sb.append(", measureHeight: ");
            sb.append(measureHeight);

            CommonLayoutParams.log(CommonLayoutParams.TAG, sb.toString());
        }

        int widthSizeAndState = resolveSizeAndState(measureWidth, widthMeasureSpec, 0);
        int heightSizeAndState = resolveSizeAndState(measureHeight, heightMeasureSpec, 0);

        this.setMeasuredDimension(widthSizeAndState, heightSizeAndState);
    }

    private void computeScaleFactor(int measureWidth, int measureHeight, boolean widthIsFinite, boolean heightIsFinite, double nativeWidth, double nativeHeight) {

        this.scaleW = 1;
        this.scaleH = 1;

        ScaleType scale = this.getScaleType();
        if ((scale == ScaleType.CENTER_CROP || scale == ScaleType.FIT_CENTER || scale == ScaleType.FIT_XY) &&
                (widthIsFinite || heightIsFinite)) {

            this.scaleW = (nativeWidth > 0) ? measureWidth / nativeWidth : 0d;
            this.scaleH = (nativeHeight > 0) ? measureHeight / nativeHeight : 0d;

            if (!widthIsFinite) {
                this.scaleW = scaleH;
            } else if (!heightIsFinite) {
                this.scaleH = scaleW;
            } else {
                // No infinite dimensions.
                switch (scale) {
                    case FIT_CENTER:
                        this.scaleH = this.scaleW < this.scaleH ? this.scaleW : this.scaleH;
                        this.scaleW = this.scaleH;
                        break;
                    case CENTER_CROP:
                        this.scaleH = this.scaleW > this.scaleH ? this.scaleW : this.scaleH;
                        this.scaleW = this.scaleH;
                        break;
                    default:
                        break;
                }
            }
        }
    }

    public void setUri(String uri, int decodeWidth, int decodeHeight, boolean useCache, boolean async, Worker.OnImageLoadedListener listener) {
        mUri = uri;
        mDecodeWidth = decodeWidth;
        mDecodeHeight = decodeHeight;
        mUseCache = useCache;
        mAsync = async;
        mListener = listener;
        if (mAttachedToWindow) {
            loadImage();
        }
    }

    private void loadImage() {
        Fetcher fetcher = Fetcher.getInstance(this.getContext());
        if (mUri != null && fetcher != null) {
            // Get the Bitmap from cache.
            fetcher.loadImage(mUri, this, mDecodeWidth, mDecodeHeight, mUseCache, mAsync, mListener);
        }
    }

    @Override
    public void setImageBitmap(Bitmap bm) {
        super.setImageBitmap(bm);
        this.mBitmap = bm;
    }

    @Override
    protected void onDraw(Canvas canvas) {
        BorderDrawable background = this.getBackground() instanceof BorderDrawable ? (BorderDrawable) this.getBackground() : null;
        float uniformBorderWidth = background != null ? background.getUniformBorderWidth() : 0;
        float uniformBorderRadius = background != null ? background.getUniformBorderRadius() : 0;

        // floor the border width to avoid gaps between the border and the image
        float roundedBorderWidth = (float) Math.floor(uniformBorderWidth);
        float innerRadius = Math.max(0, uniformBorderRadius - roundedBorderWidth);

        if (background != null) {
            background.draw(canvas);
        }

        // The border width is included in the padding so there is no need for
        // clip if there is no inner border radius.
        if (innerRadius > 0) {
            this.rect.set(
                    roundedBorderWidth,
                    roundedBorderWidth,
                    this.getWidth() - roundedBorderWidth,
                    this.getHeight() - roundedBorderWidth);

            this.path.reset();
            this.path.addRoundRect(rect, innerRadius, innerRadius, Path.Direction.CW);

            canvas.clipPath(this.path);
        }

        float rotationDegree = this.getRotationAngle();

        if (Math.abs(rotationDegree) > ImageView.EPSILON && Math.abs((rotationDegree % 90) - 0.0) < ImageView.EPSILON) {
            ScaleType scaleType = this.getScaleType();

            float viewWidth = this.getWidth() - (2 * roundedBorderWidth);
            float viewHeight = this.getHeight() - (2 * roundedBorderWidth);
            float bitmapWidth = (float) mBitmap.getWidth();
            float bitmapHeight = (float) mBitmap.getHeight();

            float scaleX;
            float scaleY;
            float decision = (rotationDegree / 90) % 2;
            if (Math.abs(Math.floor(decision) - 0) < ImageView.EPSILON) {
                scaleX = viewWidth / bitmapWidth;
                scaleY = viewHeight / bitmapHeight;
            } else {
                scaleX = viewHeight / bitmapWidth;
                scaleY = viewWidth / bitmapHeight;
            }

            float scale = 1.0f;

            if (scaleType == ScaleType.FIT_CENTER || scaleType == ScaleType.MATRIX) {
                scale = (scaleX < scaleY) ? scaleX : scaleY;
            } else if (scaleType == ScaleType.CENTER_CROP) {
                scale = (scaleX < scaleY) ? scaleY : scaleX;
            }

            Matrix matrix = this.mMatrix;
            matrix.reset();

            if (scaleType == ScaleType.CENTER_CROP || scaleType == ScaleType.FIT_CENTER || scaleType == ScaleType.MATRIX) {
                matrix.postScale(scale, scale);
                matrix.postTranslate(-(bitmapWidth * scale) / 2, -(bitmapHeight * scale) / 2);
            } else if (scaleType == ScaleType.FIT_XY) {
                matrix.postScale(scaleX, scaleY);
                matrix.postTranslate(-((bitmapWidth * scaleX) + roundedBorderWidth) / 2, -((bitmapHeight * scaleY) + roundedBorderWidth) / 2);
            }

            matrix.postRotate(rotationDegree);
            matrix.postTranslate(viewWidth / 2 + roundedBorderWidth, viewHeight / 2 + roundedBorderWidth);

            canvas.drawBitmap(this.mBitmap, matrix, null);
        } else {
            super.onDraw(canvas);
        }
    }
}
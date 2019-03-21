/**
 *
 */
package org.nativescript.widgets;

import android.content.Context;
import android.graphics.*;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.shapes.RoundRectShape;

import org.nativescript.widgets.image.BitmapOwner;
import org.nativescript.widgets.image.Fetcher;
import org.nativescript.widgets.image.Worker;
/**
 * @author hhristov
 */
public class ImageView extends android.widget.ImageView implements BitmapOwner {
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
    private boolean mKeepAspectRatio;
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

    public void setUri(String uri, int decodeWidth, int decodeHeight, boolean useCache, boolean async) {
        this.setUri(uri, decodeWidth, decodeHeight, false, useCache, async);
    }

    public void setUri(String uri, int decodeWidth, int decodeHeight, boolean keepAspectRatio, boolean useCache, boolean async) {
        mUri = uri;
        mDecodeWidth = decodeWidth;
        mDecodeHeight = decodeHeight;
        mKeepAspectRatio = keepAspectRatio;
        mUseCache = useCache;
        mAsync = async;

        // Clear current bitmap only if we set empty URI.
        // We support setting bitmap through ImageSource (e.g. Bitmap).
        if (uri == null || uri.trim() == "") {
            this.setImageBitmap(null);
        }

        // Begin loading image only if we are attached to window.
        if (mAttachedToWindow) {
            loadImage();
        }
    }

    public void setImageLoadedListener(Worker.OnImageLoadedListener listener) {
        mListener = listener;
    }

    private void loadImage() {
        Fetcher fetcher = Fetcher.getInstance(this.getContext());
        if (mUri != null && fetcher != null) {
            // Get the Bitmap from cache.
            fetcher.loadImage(mUri, this, mDecodeWidth, mDecodeHeight, mKeepAspectRatio, mUseCache, mAsync, mListener);
        }
    }

    @Override
    public void setImageBitmap(Bitmap bm) {
        Fetcher fetcher = Fetcher.getInstance(this.getContext());
        // if we have existing bitmap from uri notify fetcher that this bitmap is not shown in this ImageView instance.
        // This is needed so that fetcher inner cache could reuse the bitmap only when no other ImageView shows it.
        if (mUseCache && mUri != null && mBitmap != null && fetcher != null) {
            fetcher.removeBitmap(mUri);
        }

        super.setImageBitmap(bm);
        this.mBitmap = bm;
    }

    @Override
    protected void onDraw(Canvas canvas) {
        BorderDrawable background = this.getBackground() instanceof BorderDrawable ? (BorderDrawable) this.getBackground() : null;

        if (this.mBitmap != null) {
            float borderTopLeftRadius, borderTopRightRadius, borderBottomRightRadius, borderBottomLeftRadius;

            if (background != null) {
                background.draw(canvas);

                borderTopLeftRadius = background.getBorderTopLeftRadius();
                borderTopRightRadius = background.getBorderTopRightRadius();
                borderBottomRightRadius = background.getBorderBottomRightRadius();
                borderBottomLeftRadius = background.getBorderBottomLeftRadius();
            } else {
                borderTopLeftRadius = borderTopRightRadius = borderBottomRightRadius = borderBottomLeftRadius = 0;
            }

            // Padding?
            float borderTopWidth = this.getPaddingTop();
            float borderRightWidth = this.getPaddingRight();
            float borderBottomWidth = this.getPaddingBottom();
            float borderLeftWidth = this.getPaddingLeft();

            float innerWidth, innerHeight;

            float rotationDegree = this.getRotationAngle();
            boolean swap = Math.abs(rotationDegree % 180) > 45 && Math.abs(rotationDegree % 180) < 135;

            innerWidth = this.getWidth() - borderLeftWidth - borderRightWidth;
            innerHeight = this.getHeight() - borderTopWidth - borderBottomWidth;

            // TODO: Capture all created objects here in locals and update them instead...
            Path path = new Path();
            float[] radii = {
                Math.max(0, borderTopLeftRadius - borderLeftWidth), Math.max(0, borderTopLeftRadius - borderTopWidth),
                Math.max(0, borderTopRightRadius - borderRightWidth), Math.max(0, borderTopRightRadius - borderTopWidth),
                Math.max(0, borderBottomRightRadius - borderRightWidth), Math.max(0, borderBottomRightRadius - borderBottomWidth),
                Math.max(0, borderBottomLeftRadius - borderLeftWidth), Math.max(0, borderBottomLeftRadius - borderBottomWidth)
            };
            path.addRoundRect(new RectF(borderLeftWidth, borderTopWidth, borderLeftWidth + innerWidth, borderTopWidth + innerHeight), radii, Path.Direction.CW);

            Paint paint = new Paint();
            BitmapShader bitmapShader = new BitmapShader(this.mBitmap, Shader.TileMode.CLAMP, Shader.TileMode.CLAMP);

            float bitmapWidth = (float) mBitmap.getWidth();
            float bitmapHeight = (float) mBitmap.getHeight();

            Matrix matrix = this.mMatrix;
            matrix.reset();

            matrix.postRotate(rotationDegree, bitmapWidth / 2, bitmapHeight / 2);
            if (swap) {
                matrix.postTranslate((bitmapHeight - bitmapWidth) / 2, (bitmapWidth - bitmapHeight) / 2);
                float temp = bitmapWidth;
                bitmapWidth = bitmapHeight;
                bitmapHeight = temp;
            }

            float fittingScaleX = innerWidth / bitmapWidth;
            float fittingScaleY = innerHeight / bitmapHeight;

            float uniformScale;
            float pivotX, pivotY;
            switch(this.getScaleType()) {
                case FIT_CENTER: // aspectFit
                    uniformScale = Math.min(fittingScaleX, fittingScaleY);
                    matrix.postTranslate((innerWidth - bitmapWidth) / 2, (innerHeight - bitmapHeight) / 2);
                    matrix.postScale(uniformScale, uniformScale, innerWidth / 2, innerHeight / 2);
                    canvas.clipRect(
                        borderLeftWidth + (innerWidth - bitmapWidth * uniformScale) / 2,
                        borderTopWidth + (innerHeight - bitmapHeight * uniformScale) / 2,
                        borderLeftWidth + (innerWidth + bitmapWidth * uniformScale) / 2,
                        borderTopWidth + (innerHeight + bitmapHeight * uniformScale) / 2
                    );
                    break;
                case CENTER_CROP: // aspectFill
                    uniformScale = Math.max(fittingScaleX, fittingScaleY);
                    matrix.postTranslate((innerWidth - bitmapWidth) / 2, (innerHeight - bitmapHeight) / 2);
                    matrix.postScale(uniformScale, uniformScale, innerWidth / 2, innerHeight / 2);
                    canvas.clipRect(
                        borderLeftWidth + (innerWidth - bitmapWidth * uniformScale) / 2,
                        borderTopWidth + (innerHeight - bitmapHeight * uniformScale) / 2,
                        borderLeftWidth + (innerWidth + bitmapWidth * uniformScale) / 2,
                        borderTopWidth + (innerHeight + bitmapHeight * uniformScale) / 2
                    );
                    break;
                case FIT_XY: // fill
                    matrix.postScale(fittingScaleX, fittingScaleY);
                    break;
                case MATRIX: // none
                    canvas.clipRect(
                        borderLeftWidth,
                        borderTopWidth,
                        borderLeftWidth + bitmapWidth,
                        borderTopWidth + bitmapHeight
                    );
                    break;
            }
            matrix.postTranslate(borderLeftWidth, borderTopWidth);
            bitmapShader.setLocalMatrix(matrix);
            paint.setAntiAlias(true);
            paint.setFilterBitmap(true);
            paint.setShader(bitmapShader);
            ColorFilter filter = this.getColorFilter();
            if (filter != null) {
                paint.setColorFilter(filter);
            }
            canvas.drawPath(path, paint);
        }
    }

    @Override
    public void setBitmap(Bitmap value) {
        this.setImageBitmap(value);
    }

    @Override
    public void setDrawable(Drawable asyncDrawable) {
        this.setImageDrawable(asyncDrawable);
    }
}
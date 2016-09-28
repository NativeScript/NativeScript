/**
 * 
 */
package org.nativescript.widgets;

import android.content.Context;
import android.graphics.*;
import android.graphics.drawable.Drawable;
import android.util.Log;

/**
 * @author hhristov
 * 
 */
public class ImageView extends android.widget.ImageView {
    private static final double EPSILON = 1E-05;

    private Path path = new Path();
    private RectF rect = new RectF();

    private double scaleW = 1;
    private double scaleH = 1;
	
	private float rotationAngle;

    public float getRotationAngle() {
        return rotationAngle;
    }

    public void setRotationAngle(float rotationAngle) {
        this.rotationAngle = rotationAngle;
    }

    public ImageView(Context context) {
        super(context);
        this.mMatrix = new Matrix();
        this.setScaleType(ScaleType.FIT_CENTER);
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

    private Matrix mMatrix;
    private Bitmap pBitmap;

    @Override
    public void setImageBitmap(Bitmap bm) {
        super.setImageBitmap(bm);
        this.pBitmap = bm;
    }

    @Override
    protected void onDraw(Canvas canvas) {
        BorderDrawable background = this.getBackground() instanceof BorderDrawable ? (BorderDrawable)this.getBackground() : null;
        float uniformBorderWidth = background != null ? background.getUniformBorderWidth() * background.getDensity() : 0;
        float uniformBorderRadius = background != null ? background.getUniformBorderRadius() * background.getDensity() : 0;

        // floor the border width to avoid gaps between the border and the image
        float roundedBorderWidth = (float) Math.floor(uniformBorderWidth);
        float innerRadius = Math.max(0, uniformBorderRadius - roundedBorderWidth);

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
            float bitmapWidth = (float) pBitmap.getWidth();
            float bitmapHeight = (float) pBitmap.getHeight();

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
            }
            else if (scaleType == ScaleType.CENTER_CROP) {
                scale = (scaleX < scaleY) ? scaleY : scaleX;
            }

            Matrix matrix = this.mMatrix;
            matrix.reset();

            if (scaleType == ScaleType.CENTER_CROP || scaleType == ScaleType.FIT_CENTER || scaleType == ScaleType.MATRIX) {
				matrix.postScale(scale, scale);
            	matrix.postTranslate(-(bitmapWidth * scale) / 2, -(bitmapHeight * scale) / 2);
            }
            else if (scaleType == ScaleType.FIT_XY) {
                matrix.postScale(scaleX, scaleY);
                matrix.postTranslate(-((bitmapWidth * scaleX) + roundedBorderWidth) / 2, -((bitmapHeight * scaleY) + roundedBorderWidth) / 2);
            }
			
			matrix.postRotate(rotationDegree);
			matrix.postTranslate(viewWidth / 2 + roundedBorderWidth, viewHeight / 2 + roundedBorderWidth);

            canvas.drawBitmap(this.pBitmap, matrix, null);
        }
        else {
            super.onDraw(canvas);
        }
		
		if (background != null) {
			background.draw(canvas);
		}
    }
}
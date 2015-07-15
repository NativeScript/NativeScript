/**
 * 
 */
package org.nativescript.widgets;

import android.content.Context;
import android.graphics.drawable.Drawable;

/**
 * @author hhristov
 *
 */
public class ImageView extends android.widget.ImageView {

	private double scaleW = 1;
	private double scaleH = 1;
	
	public ImageView(Context context) {
		super(context);
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
        }
        else {
        	measureWidth = 0;
        	measureHeight = 0;	
        }
		
		boolean finiteWidth = widthMode != MeasureSpec.UNSPECIFIED;
		boolean finiteHeight = heightMode != MeasureSpec.UNSPECIFIED;
		
		if (measureWidth != 0 && measureHeight != 0 && (finiteWidth || finiteHeight)) {
		    this.computeScaleFactor(width, height, finiteWidth, finiteHeight, measureWidth, measureHeight);
		    int resultW = (int) Math.floor(measureWidth * this.scaleW);
		    int resultH = (int) Math.floor(measureHeight * this.scaleH);
		
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
	        
	        CommonLayoutParams.log(CommonLayoutParams.tag, sb.toString());
		}
		
        int widthSizeAndState = resolveSizeAndState(measureWidth, widthMeasureSpec, 0);
        int heightSizeAndState = resolveSizeAndState(measureHeight, heightMeasureSpec, 0);

        this.setMeasuredDimension(widthSizeAndState, heightSizeAndState);
	}

	private void computeScaleFactor(
			int measureWidth, 
	    	int measureHeight, 
	    	boolean widthIsFinite, 
	    	boolean heightIsFinite, 
	    	double nativeWidth, 
	    	double nativeHeight) {
		
		this.scaleW = 1;
		this.scaleH = 1;

		ScaleType scale = this.getScaleType();		
        if ((scale == ScaleType.CENTER_CROP || scale == ScaleType.FIT_CENTER || scale == ScaleType.FIT_XY) &&
            (widthIsFinite || heightIsFinite)) {

        	this.scaleW = (nativeWidth > 0) ? measureWidth / nativeWidth : 0d;
        	this.scaleH = (nativeHeight > 0) ? measureHeight / nativeHeight : 0d;

            if (!widthIsFinite) {
            	this.scaleW = scaleH;
            }
            else if (!heightIsFinite) {
            	this.scaleH = scaleW;
            }
            else {
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
}

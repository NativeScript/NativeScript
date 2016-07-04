package org.nativescript.widgets;

import android.annotation.TargetApi;
import android.graphics.Bitmap;
import android.graphics.BitmapShader;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.PointF;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.drawable.ColorDrawable;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Created by hristov on 6/15/2016.
 */
public class BorderDrawable extends ColorDrawable {
    private float density;
    private float borderWidth;
    private int borderColor;
    private float borderRadius;
    private String clipPath;
    private int backgroundColor;
    private Bitmap backgroundImage;
    private String backgroundRepeat;
    private String backgroundPosition;
    private CSSValue[] backgroundPositionParsedCSSValues;
    private String backgroundSize;
    private CSSValue[] backgroundSizeParsedCSSValues;

    public float getBorderWidth() {
        return borderWidth;
    }

    public int getBorderColor() {
        return borderColor;
    }

    public float getBorderRadius() {
        return borderRadius;
    }

    public String getClipPath() {
        return clipPath;
    }

    public int getBackgroundColor() {
        return backgroundColor;
    }

    public Bitmap getBackgroundImage() {
        return backgroundImage;
    }

    public String getBackgroundRepeat() {
        return backgroundRepeat;
    }

    public String getBackgroundPosition() {
        return backgroundPosition;
    }

    public String getBackgroundSize() {
        return backgroundSize;
    }

    public BorderDrawable(float density){
        super();
        this.density = density;
    }

    public void refresh(float borderWidth,
                        int borderColor,
                        float borderRadius,
                        String clipPath,
                        int backgroundColor,
                        Bitmap backgroundImage,
                        String backgroundRepeat,
                        String backgroundPosition,
                        CSSValue[] backgroundPositionParsedCSSValues,
                        String backgroundSize,
                        CSSValue[] backgroundSizeParsedCSSValues){
        this.borderWidth = borderWidth;
        this.borderColor = borderColor;
        this.borderRadius = borderRadius;
        this.clipPath = clipPath;
        this.backgroundColor = backgroundColor;
        this.backgroundImage = backgroundImage;
        this.backgroundRepeat = backgroundRepeat;
        this.backgroundPosition = backgroundPosition;
        this.backgroundPositionParsedCSSValues = backgroundPositionParsedCSSValues;
        this.backgroundSize = backgroundSize;
        this.backgroundSizeParsedCSSValues = backgroundSizeParsedCSSValues;
        this.invalidateSelf();
    }

    @Override
    public void draw(Canvas canvas) {
        Rect bounds = this.getBounds();
        float borderWidth = this.borderWidth * this.density;
        float halfBorderWidth = borderWidth / 2.0f;

        // We will inset background colors and images so antialiasing will not color pixels outside the border.
        // If the border is transparent we will backoff less, and we will not backoff more than half a pixel or half the border width.
        float normalizedBorderAlpha = ((float)Color.alpha(this.borderColor)) / 255.0f;
        float backoffAntialias = Math.min(0.5f, halfBorderWidth) * normalizedBorderAlpha;
        RectF backgroundBoundsF = new RectF(bounds.left + backoffAntialias, bounds.top + backoffAntialias, bounds.right - backoffAntialias, bounds.bottom - backoffAntialias);

        float outerRadius = this.borderRadius * this.density;

        // draw background
        if (this.backgroundColor != 0) {
            Paint backgroundColorPaint = new Paint();
            backgroundColorPaint.setStyle(Paint.Style.FILL);
            backgroundColorPaint.setColor(this.backgroundColor);
            backgroundColorPaint.setAntiAlias(true);

            if (this.clipPath != null && !this.clipPath.isEmpty()) {
                drawClipPath(this.clipPath, canvas, backgroundColorPaint, backgroundBoundsF, density);
            }
            else {
                canvas.drawRoundRect(backgroundBoundsF, outerRadius, outerRadius, backgroundColorPaint);
            }
        }

        if (this.backgroundImage != null){
            BackgroundDrawParams params = this.getDrawParams(bounds.width(), bounds.height());
            Matrix transform = new Matrix();
            if (params.sizeX > 0 && params.sizeY > 0) {
                float scaleX = params.sizeX / this.backgroundImage.getWidth();
                float scaleY = params.sizeY / this.backgroundImage.getHeight();
                transform.setScale(scaleX, scaleY, 0, 0);
            } else {
                params.sizeX = this.backgroundImage.getWidth();
                params.sizeY = this.backgroundImage.getHeight();
            }
            transform.postTranslate(params.posX - backoffAntialias, params.posY - backoffAntialias);

            BitmapShader shader = new BitmapShader(this.backgroundImage, android.graphics.Shader.TileMode.REPEAT, android.graphics.Shader.TileMode.REPEAT);
            shader.setLocalMatrix(transform);

            Paint backgroundImagePaint = new Paint();
            backgroundImagePaint.setShader(shader);

            float imageWidth = params.repeatX ? bounds.width() : params.sizeX;
            float imageHeight = params.repeatY ? bounds.height() : params.sizeY;
            params.posX = params.repeatX ? 0 : params.posX;
            params.posY = params.repeatY ? 0 : params.posY;

            if (this.clipPath != null && !this.clipPath.isEmpty()) {
                drawClipPath(this.clipPath, canvas, backgroundImagePaint, backgroundBoundsF, density);
            }
            else {
                boolean supportsPathOp = android.os.Build.VERSION.SDK_INT >= 19;
                if (supportsPathOp) {
                    // Path.Op can be used in API level 19+ to achieve the perfect geometry.
                    Path backgroundPath = new Path();
                    backgroundPath.addRoundRect(backgroundBoundsF, outerRadius, outerRadius, Path.Direction.CCW);
                    Path backgroundNoRepeatPath = new Path();
                    backgroundNoRepeatPath.addRect(params.posX, params.posY, params.posX + imageWidth, params.posY + imageHeight, Path.Direction.CCW);
                    intersect(backgroundPath, backgroundNoRepeatPath);
                    canvas.drawPath(backgroundPath, backgroundImagePaint);
                } else {
                    // Clipping here will not be anti-aliased but at least it won't shine through the rounded corners.
                    canvas.save();
                    canvas.clipRect(params.posX, params.posY, params.posX + imageWidth, params.posY + imageHeight);
                    canvas.drawRoundRect(backgroundBoundsF, outerRadius, outerRadius, backgroundImagePaint);
                    canvas.restore();
                }
            }
        }

        // draw border
        if (borderWidth > 0 && this.borderColor != 0) {
            RectF middleBoundsF = new RectF(bounds.left + halfBorderWidth, bounds.top + halfBorderWidth, bounds.right - halfBorderWidth, bounds.bottom - halfBorderWidth);
            Paint borderPaint = new Paint();
            borderPaint.setColor(this.borderColor);
            borderPaint.setAntiAlias(true);

            if (this.clipPath != null && !this.clipPath.isEmpty()) {
                borderPaint.setStyle(Paint.Style.STROKE);
                borderPaint.setStrokeWidth(borderWidth);
                drawClipPath(this.clipPath, canvas, borderPaint, backgroundBoundsF, density);
            } else {
                if (outerRadius <= 0) {
                    borderPaint.setStyle(Paint.Style.STROKE);
                    borderPaint.setStrokeWidth(borderWidth);
                    canvas.drawRect(middleBoundsF, borderPaint);
                } else if (outerRadius >= borderWidth) {
                    borderPaint.setStyle(Paint.Style.STROKE);
                    borderPaint.setStrokeWidth(borderWidth);
                    float middleRadius = Math.max(0, outerRadius - halfBorderWidth);
                    canvas.drawRoundRect(middleBoundsF, middleRadius, middleRadius, borderPaint);
                } else {
                    Path borderPath = new Path();
                    RectF borderOuterBoundsF = new RectF(bounds.left, bounds.top, bounds.right, bounds.bottom);
                    borderPath.addRoundRect(borderOuterBoundsF, outerRadius, outerRadius, Path.Direction.CCW);
                    RectF borderInnerBoundsF = new RectF(bounds.left + borderWidth, bounds.top + borderWidth, bounds.right - borderWidth, bounds.bottom - borderWidth);
                    borderPath.addRect(borderInnerBoundsF, Path.Direction.CW);
                    borderPaint.setStyle(Paint.Style.FILL);
                    canvas.drawPath(borderPath, borderPaint);
                }
            }
        }
    }

    @TargetApi(19)
    private static void intersect(Path path1, Path path2){
        path1.op(path2, Path.Op.INTERSECT);
    }

    private static Pattern spaceAndComma = Pattern.compile("[\\s,]+");
    private static Pattern space = Pattern.compile("\\s+");
    private static void drawClipPath(String clipPath, Canvas canvas, Paint paint, RectF bounds, float density) {
        // Sample string is polygon(20% 0%, 0% 20%, 30% 50%, 0% 80%, 20% 100%, 50% 70%, 80% 100%, 100% 80%, 70% 50%, 100% 20%, 80% 0%, 50% 30%);
        String functionName = clipPath.substring(0, clipPath.indexOf("("));
        String value = clipPath.substring(clipPath.indexOf("(") + 1, clipPath.indexOf(")"));

        String[] arr;
        switch (functionName){
            case "rect":
                arr = spaceAndComma.split(value);
                float top = cssValueToDevicePixels(arr[0], bounds.top, density);
                float left = cssValueToDevicePixels(arr[1], bounds.left, density);
                float bottom = cssValueToDevicePixels(arr[2], bounds.bottom, density);
                float right = cssValueToDevicePixels(arr[3], bounds.right, density);
                canvas.drawRect(left, top, right, bottom, paint);
                break;
            case "circle":
                arr = space.split(value);
                float radius = cssValueToDevicePixels(arr[0], (bounds.width() > bounds.height() ? bounds.height() : bounds.width()) / 2, density);
                float y = cssValueToDevicePixels(arr[2], bounds.height(), density);
                float x = cssValueToDevicePixels(arr[3], bounds.width(), density);
                canvas.drawCircle(x, y, radius, paint);
                break;
            case "ellipse":
                arr = space.split(value);
                float rX = cssValueToDevicePixels(arr[0], bounds.right, density);
                float rY = cssValueToDevicePixels(arr[1], bounds.bottom, density);
                float cX = cssValueToDevicePixels(arr[3], bounds.right, density);
                float cY = cssValueToDevicePixels(arr[4], bounds.bottom, density);
                left = cX - rX;
                top = cY - rY;
                right = (rX * 2) + left;
                bottom = (rY * 2) + top;
                canvas.drawOval(new RectF(left, top, right, bottom), paint);
                break;
            case "polygon":
                Path path = new Path();
                PointF firstPoint = null;
                arr = value.split(",");
                for (String s : arr) {
                    String[] xy = space.split(s.trim());
                    PointF point = new PointF(cssValueToDevicePixels(xy[0], bounds.width(), density), cssValueToDevicePixels(xy[1], bounds.height(), density));

                    if (firstPoint == null) {
                        firstPoint = point;
                        path.moveTo(point.x, point.y);
                    }

                    path.lineTo(point.x, point.y);
                }
                if (firstPoint != null){
                    path.lineTo(firstPoint.x, firstPoint.y);
                }
                canvas.drawPath(path, paint);
                break;
        }
    }

    private BackgroundDrawParams getDrawParams(float width, float height) {
        BackgroundDrawParams res = new BackgroundDrawParams();

        // repeat
        if (this.backgroundRepeat != null && !this.backgroundRepeat.isEmpty()) {
            switch (this.backgroundRepeat.toLowerCase(Locale.ENGLISH)) {
                case "no-repeat":
                    res.repeatX = false;
                    res.repeatY = false;
                    break;

                case "repeat-x":
                    res.repeatY = false;
                    break;

                case "repeat-y":
                    res.repeatX = false;
                    break;
            }
        }

        float imageWidth = this.backgroundImage.getWidth();
        float imageHeight = this.backgroundImage.getHeight();

        // size
        if (this.backgroundSize != null && !this.backgroundSize.isEmpty()) {
            if (this.backgroundSizeParsedCSSValues.length == 2) {
                CSSValue vx = this.backgroundSizeParsedCSSValues[0];
                CSSValue vy = this.backgroundSizeParsedCSSValues[1];
                if ("%".equals(vx.getUnit()) && "%".equals(vy.getUnit())) {
                    imageWidth = width * vx.getValue() / 100;
                    imageHeight = height * vy.getValue() / 100;

                    res.sizeX = imageWidth;
                    res.sizeY = imageHeight;
                }
                else if ("number".equals(vx.getType()) && "number".equals(vy.getType()) &&
                        (("px".equals(vx.getUnit()) && "px".equals(vy.getUnit())) || ((vx.getUnit() == null || vx.getUnit().isEmpty()) && (vy.getUnit() == null || vy.getUnit().isEmpty())))) {
                    imageWidth = vx.getValue();
                    imageHeight = vy.getValue();

                    res.sizeX = imageWidth;
                    res.sizeY = imageHeight;
                }
            }
            else if (this.backgroundSizeParsedCSSValues.length == 1 && "ident".equals(this.backgroundSizeParsedCSSValues[0].getType())) {
                float scale = 0;

                if ("cover".equals(this.backgroundSizeParsedCSSValues[0].getString())) {
                    scale = Math.max(width / imageWidth, height / imageHeight);
                }
                else if ("contain".equals(this.backgroundSizeParsedCSSValues[0].getString())) {
                    scale = Math.min(width / imageWidth, height / imageHeight);
                }

                if (scale > 0) {
                    imageWidth *= scale;
                    imageHeight *= scale;

                    res.sizeX = imageWidth;
                    res.sizeY = imageHeight;
                }
            }
        }

        // position
        if (this.backgroundPosition != null && !this.backgroundPosition.isEmpty()) {
            CSSValue[] xy = parsePosition(this.backgroundPositionParsedCSSValues);
            if (xy != null) {
                CSSValue vx = xy[0];
                CSSValue vy = xy[1];
                float spaceX = width - imageWidth;
                float spaceY = height - imageHeight;

                if ("%".equals(vx.getUnit()) && "%".equals(vy.getUnit())) {
                    res.posX = spaceX * vx.getValue() / 100;
                    res.posY = spaceY * vy.getValue() / 100;
                }
                else if ("number".equals(vx.getType()) && "number".equals(vy.getType()) &&
                        (("px".equals(vx.getUnit()) && "px".equals(vy.getUnit())) || ((vx.getUnit() == null || vx.getUnit().isEmpty()) && (vy.getUnit() == null || vy.getUnit().isEmpty())))) {
                    res.posX = vx.getValue();
                    res.posY = vy.getValue();
                }
                else if ("ident".equals(vx.getType()) && "ident".equals(vy.getType())) {
                    if ("center".equals(vx.getString().toLowerCase(Locale.ENGLISH))) {
                        res.posX = spaceX / 2;
                    }
                    else if ("right".equals(vx.getString().toLowerCase(Locale.ENGLISH))) {
                        res.posX = spaceX;
                    }

                    if ("center".equals(vy.getString().toLowerCase(Locale.ENGLISH))) {
                        res.posY = spaceY / 2;
                    }
                    else if ("bottom".equals(vy.getString().toLowerCase(Locale.ENGLISH))) {
                        res.posY = spaceY;
                    }
                }
            }
        }

        return res;
    }

    private static CSSValue[] parsePosition(CSSValue[] values) {
        if (values.length == 2) {
            return values;
        }

        CSSValue[] result = null;
        if (values.length == 1 && "ident".equals(values[0].getType())) {
            String val = values[0].getString().toLowerCase(Locale.ENGLISH);
            CSSValue center = new CSSValue("ident", "center", null, 0);

            // If you only one keyword is specified, the other value is "center"
            if ("left".equals(val) || "right".equals(val)) {
                result  = new CSSValue[] {values[0], center};
            }
            else if ("top".equals(val) || "bottom".equals(val)) {
                result  = new CSSValue[] {center, values[0]};
            }
            else if ("center".equals(val)) {
                result  = new CSSValue[] {center, center};
            }
        }

        return result;
    }

    private static float cssValueToDevicePixels(String source, float total, float density) {
        float result;
        source = source.trim();

        if (source.indexOf("px") > -1) {
            result = Float.parseFloat(source.replace("px", ""));
        }
        else if (source.indexOf("%") > -1 && total > 0) {
            result = (Float.parseFloat(source.replace("%", "")) / 100) * (total / density);
        } else {
            result = Float.parseFloat(source);
        }
        return result * density;
    }

    private class BackgroundDrawParams {
        private boolean repeatX = true;
        private boolean repeatY = true;
        private float posX;
        private float posY;
        private float sizeX;
        private float sizeY;
    }
}

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
import android.util.Log;

import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Created by hristov on 6/15/2016.
 */
public class BorderDrawable extends ColorDrawable {
    private float density;
    private String id;

    private int borderTopColor;
    private int borderRightColor;
    private int borderBottomColor;
    private int borderLeftColor;

    private float borderTopWidth;
    private float borderRightWidth;
    private float borderBottomWidth;
    private float borderLeftWidth;

    private float borderTopLeftRadius;
    private float borderTopRightRadius;
    private float borderBottomRightRadius;
    private float borderBottomLeftRadius;

    private String clipPath;

    private int backgroundColor;
    private Bitmap backgroundImage;
    private String backgroundRepeat;
    private String backgroundPosition;
    private CSSValue[] backgroundPositionParsedCSSValues;
    private String backgroundSize;
    private CSSValue[] backgroundSizeParsedCSSValues;

    public float getDensity() {
        return density;
    }

    public int getBorderTopColor() {
        return borderTopColor;
    }

    public int getBorderRightColor() {
        return borderRightColor;
    }

    public int getBorderBottomColor() {
        return borderBottomColor;
    }

    public int getBorderLeftColor() {
        return borderLeftColor;
    }

    public int getUniformBorderColor() {
        if (this.hasUniformBorderColor()){
            return this.borderTopColor;
        }

        return 0;
    }

    public float getBorderTopWidth() {
        return borderTopWidth;
    }

    public float getBorderRightWidth() {
        return borderRightWidth;
    }

    public float getBorderBottomWidth() {
        return borderBottomWidth;
    }

    public float getBorderLeftWidth() {
        return borderLeftWidth;
    }

    public float getUniformBorderWidth() {
        if (this.hasUniformBorderWidth()){
            return this.borderTopWidth;
        }

        return 0;
    }

    public float getBorderTopLeftRadius() {
        return borderTopLeftRadius;
    }

    public float getBorderTopRightRadius() {
        return borderTopRightRadius;
    }

    public float getBorderBottomRightRadius() {
        return borderBottomRightRadius;
    }

    public float getBorderBottomLeftRadius() {
        return borderBottomLeftRadius;
    }

    public float getUniformBorderRadius() {
        if (this.hasUniformBorderRadius()){
            return this.borderTopLeftRadius;
        }

        return 0;
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

    public boolean hasUniformBorderColor() {
        return  this.borderTopColor == this.borderRightColor &&
                this.borderTopColor == this.borderBottomColor &&
                this.borderTopColor == this.borderLeftColor;
    }

    public boolean hasUniformBorderWidth() {
        return  this.borderTopWidth == this.borderRightWidth &&
                this.borderTopWidth == this.borderBottomWidth &&
                this.borderTopWidth == this.borderLeftWidth;
    }

    public boolean hasUniformBorderRadius() {
        return  this.borderTopLeftRadius == this.borderTopRightRadius &&
                this.borderTopLeftRadius == this.borderBottomRightRadius &&
                this.borderTopLeftRadius == this.borderBottomLeftRadius;
    }

    public boolean hasUniformBorder(){
        return  this.hasUniformBorderColor() &&
                this.hasUniformBorderWidth() &&
                this.hasUniformBorderRadius();
    }

    public BorderDrawable(float density){
        super();
        this.density = density;
    }

    public BorderDrawable(float density, String id){
        super();
        this.density = density;
        this.id = id;
    }

    // For backwards compatibility
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
        this.refresh(
                borderColor,
                borderColor,
                borderColor,
                borderColor,

                borderWidth,
                borderWidth,
                borderWidth,
                borderWidth,

                borderRadius,
                borderRadius,
                borderRadius,
                borderRadius,

                clipPath,

                backgroundColor,
                backgroundImage,
                backgroundRepeat,
                backgroundPosition,
                backgroundPositionParsedCSSValues,
                backgroundSize,
                backgroundSizeParsedCSSValues
        );
    }

    public void refresh(int borderTopColor,
                        int borderRightColor,
                        int borderBottomColor,
                        int borderLeftColor,

                        float borderTopWidth,
                        float borderRightWidth,
                        float borderBottomWidth,
                        float borderLeftWidth,

                        float borderTopLeftRadius,
                        float borderTopRightRadius,
                        float borderBottomRightRadius,
                        float borderBottomLeftRadius,

                        String clipPath,

                        int backgroundColor,
                        Bitmap backgroundImage,
                        String backgroundRepeat,
                        String backgroundPosition,
                        CSSValue[] backgroundPositionParsedCSSValues,
                        String backgroundSize,
                        CSSValue[] backgroundSizeParsedCSSValues){

        this.borderTopColor = borderTopColor;
        this.borderRightColor = borderRightColor;
        this.borderBottomColor = borderBottomColor;
        this.borderLeftColor = borderLeftColor;

        this.borderTopWidth = borderTopWidth;
        this.borderRightWidth = borderRightWidth;
        this.borderBottomWidth = borderBottomWidth;
        this.borderLeftWidth = borderLeftWidth;

        this.borderTopLeftRadius = borderTopLeftRadius;
        this.borderTopRightRadius = borderTopRightRadius;
        this.borderBottomRightRadius = borderBottomRightRadius;
        this.borderBottomLeftRadius = borderBottomLeftRadius;

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
        if (bounds.width() <= 0 || bounds.height() <= 0) {
            // When the view is off-screen the bounds might be empty and we don't have anything to draw.
            return;
        }

        float topBackoffAntialias = calculateBackoffAntialias(this.borderTopColor, this.borderTopWidth, this.density);
        float rightBackoffAntialias = calculateBackoffAntialias(this.borderRightColor, this.borderRightWidth, this.density);
        float bottomBackoffAntialias = calculateBackoffAntialias(this.borderBottomColor, this.borderBottomWidth, this.density);
        float leftBackoffAntialias = calculateBackoffAntialias(this.borderLeftColor, this.borderLeftWidth, this.density);

        RectF backgroundBoundsF = new RectF(
                bounds.left + leftBackoffAntialias,
                bounds.top + topBackoffAntialias,
                bounds.right - rightBackoffAntialias,
                bounds.bottom - bottomBackoffAntialias);

        float outerRadius = this.getUniformBorderRadius() * this.density;

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
            transform.postTranslate(params.posX - leftBackoffAntialias, params.posY - topBackoffAntialias);

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
                }
                else {
                    // Clipping here will not be anti-aliased but at least it won't shine through the rounded corners.
                    canvas.save();
                    canvas.clipRect(params.posX, params.posY, params.posX + imageWidth, params.posY + imageHeight);
                    canvas.drawRoundRect(backgroundBoundsF, outerRadius, outerRadius, backgroundImagePaint);
                    canvas.restore();
                }
            }
        }

        // draw border
        if (this.hasUniformBorder()){
            float borderWidth = this.getUniformBorderWidth() * this.density;
            int borderColor = this.getUniformBorderColor();

            // iOS and browsers use black when no color is specified.
            if (borderColor == Color.TRANSPARENT){
                borderColor = Color.BLACK;
            }
            if (borderWidth > 0) {
                float halfBorderWidth = borderWidth / 2.0f;
                RectF middleBoundsF = new RectF(bounds.left + halfBorderWidth, bounds.top + halfBorderWidth, bounds.right - halfBorderWidth, bounds.bottom - halfBorderWidth);
                Paint borderPaint = new Paint();
                borderPaint.setColor(borderColor);
                borderPaint.setAntiAlias(true);
                if (this.clipPath != null && !this.clipPath.isEmpty()) {
                    borderPaint.setStyle(Paint.Style.STROKE);
                    borderPaint.setStrokeWidth(borderWidth);
                    drawClipPath(this.clipPath, canvas, borderPaint, backgroundBoundsF, density);
                }
                else {
                    if (outerRadius <= 0) {
                        borderPaint.setStyle(Paint.Style.STROKE);
                        borderPaint.setStrokeWidth(borderWidth);
                        canvas.drawRect(middleBoundsF, borderPaint);
                    }
                    else if (outerRadius >= borderWidth) {
                        borderPaint.setStyle(Paint.Style.STROKE);
                        borderPaint.setStrokeWidth(borderWidth);
                        float middleRadius = Math.max(0, outerRadius - halfBorderWidth);
                        canvas.drawRoundRect(middleBoundsF, middleRadius, middleRadius, borderPaint);
                    }
                    else {
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
        else {
            float top = this.borderTopWidth * this.density;
            float right = this.borderRightWidth * this.density;
            float bottom = this.borderBottomWidth * this.density;
            float left = this.borderLeftWidth * this.density;

            //lto                       rto
            //   +---------------------+
            //   |lti               rti|
            //   |                     |
            //   |                     |
            //   |                     |
            //   |                     |
            //   |lbi               rbi|
            //   +---------------------+
            //lbo                       rbo

            PointF lto = new PointF(0, 0); // left-top-outside
            PointF lti = new PointF(left, top); // left-top-inside

            PointF rto = new PointF(bounds.right, 0); // right-top-outside
            PointF rti = new PointF(bounds.right - right, top); // right-top-outside

            PointF rbo = new PointF(bounds.right, bounds.bottom); // right-bottom-outside
            PointF rbi = new PointF(bounds.right - right, bounds.bottom - bottom); // right-bottom-inside

            PointF lbo = new PointF(0, bounds.bottom); // left-bottom-outside
            PointF lbi = new PointF(left, bounds.bottom - bottom); // left-bottom-inside

            if (this.borderTopWidth > 0){
                Paint topBorderPaint = new Paint();
                topBorderPaint.setColor(this.borderTopColor);
                topBorderPaint.setAntiAlias(true);
                Path topBorderPath = new Path();
                topBorderPath.setFillType(Path.FillType.EVEN_ODD);
                topBorderPath.moveTo(lto.x, lto.y);
                topBorderPath.lineTo(rto.x, rto.y);
                topBorderPath.lineTo(rti.x, rti.y);
                topBorderPath.lineTo(lti.x, lti.y);
                topBorderPath.close();
                canvas.drawPath(topBorderPath, topBorderPaint);
            }

            if (this.borderRightWidth > 0){
                Paint rightBorderPaint = new Paint();
                rightBorderPaint.setColor(this.borderRightColor);
                rightBorderPaint.setAntiAlias(true);
                Path rightBorderPath = new Path();
                rightBorderPath.setFillType(Path.FillType.EVEN_ODD);
                rightBorderPath.moveTo(rto.x, rto.y);
                rightBorderPath.lineTo(rbo.x, rbo.y);
                rightBorderPath.lineTo(rbi.x, rbi.y);
                rightBorderPath.lineTo(rti.x, rti.y);
                rightBorderPath.close();
                canvas.drawPath(rightBorderPath, rightBorderPaint);
            }

            if (this.borderBottomWidth > 0){
                Paint bottomBorderPaint = new Paint();
                bottomBorderPaint.setColor(this.borderBottomColor);
                bottomBorderPaint.setAntiAlias(true);
                Path bottomBorderPath = new Path();
                bottomBorderPath.setFillType(Path.FillType.EVEN_ODD);
                bottomBorderPath.moveTo(rbo.x, rbo.y);
                bottomBorderPath.lineTo(lbo.x, lbo.y);
                bottomBorderPath.lineTo(lbi.x, lbi.y);
                bottomBorderPath.lineTo(rbi.x, rbi.y);
                bottomBorderPath.close();
                canvas.drawPath(bottomBorderPath, bottomBorderPaint);
            }

            if (this.borderLeftWidth > 0){
                Paint leftBorderPaint = new Paint();
                leftBorderPaint.setColor(this.borderLeftColor);
                leftBorderPaint.setAntiAlias(true);
                Path leftBorderPath = new Path();
                leftBorderPath.setFillType(Path.FillType.EVEN_ODD);
                leftBorderPath.moveTo(lbo.x, lbo.y);
                leftBorderPath.lineTo(lto.x, lto.y);
                leftBorderPath.lineTo(lti.x, lti.y);
                leftBorderPath.lineTo(lbi.x, lbi.y);
                leftBorderPath.close();
                canvas.drawPath(leftBorderPath, leftBorderPaint);
            }
        }
    }

    private static float calculateBackoffAntialias(int borderColor, float borderWidth, float density){
        // We will inset background colors and images so antialiasing will not color pixels outside the border.
        // If the border is transparent we will backoff less, and we will not backoff more than half a pixel or half the border width.
        float halfBorderWidth = borderWidth * density / 2.0f;
        float normalizedBorderAlpha = ((float)Color.alpha(borderColor)) / 255.0f;
        return Math.min(0.5f, halfBorderWidth) * normalizedBorderAlpha;
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

        if (source.contains("px")) {
            result = Float.parseFloat(source.replace("px", ""));
        }
        else if (source.contains("%")) {
            result = (Float.parseFloat(source.replace("%", "")) / 100) * (total / density);
        } else {
            result = Float.parseFloat(source);
        }
        return result * density;
    }

    public String toDebugString() {
        return
            getClass().getSimpleName() + "@" + Integer.toHexString(hashCode()) + "; " +

            "id: " + this.id + "; " +

            "borderTopColor: " + this.borderTopColor + "; " +
            "borderRightColor: " + this.borderRightColor + "; " +
            "borderBottomColor: " + this.borderBottomColor + "; " +
            "borderLeftColor: " + this.borderLeftColor + "; " +

            "borderTopWidth: " + this.borderTopWidth + "; " +
            "borderRightWidth: " + this.borderRightWidth + "; " +
            "borderBottomWidth: " + this.borderBottomWidth + "; " +
            "borderLeftWidth: " + this.borderLeftWidth + "; " +

            "borderTopLeftRadius: " + this.borderTopLeftRadius + "; " +
            "borderTopRightRadius: " + this.borderTopRightRadius + "; " +
            "borderBottomRightRadius: " + this.borderBottomRightRadius + "; " +
            "borderBottomLeftRadius: " + this.borderBottomLeftRadius + "; " +

            "clipPath: " + this.clipPath + "; " +
            "backgroundColor: " + this.backgroundColor + "; " +
            "backgroundImage: " + this.backgroundImage + "; " +
            "backgroundRepeat: " + this.backgroundRepeat + "; " +
            "backgroundPosition: " + this.backgroundPosition + "; " +
            "backgroundSize: " + this.backgroundSize + "; "
        ;
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
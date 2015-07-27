import utils = require("utils/utils");
import common = require("ui/styling/background-common");
import dts = require("ui/styling/background");

global.moduleMerge(common, exports);

// We are using "ad" here to avoid namespace collision with the global android object
export module ad {
    export class BorderDrawable extends android.graphics.drawable.ColorDrawable implements dts.ad.BorderDrawable {
        private _density = utils.layout.getDisplayDensity();
        private _borderWidth: number;
        private _cornerRadius: number;
        private _borderColor: number;

        constructor() {
            super();
            return global.__native(this);
        }

        get borderWidth(): number {
            return this._borderWidth;
        }
        set borderWidth(value: number) {
            if (this._borderWidth !== value) {
                this._borderWidth = value;
                this.invalidateSelf();
            }
        }

        get cornerRadius(): number {
            return this._cornerRadius;
        }
        set cornerRadius(value: number) {
            if (this._cornerRadius !== value) {
                this._cornerRadius = value;
                this.invalidateSelf();
            }
        }

        get borderColor(): number {
            return this._borderColor;
        }
        set borderColor(value: number) {
            if (this._borderColor !== value) {
                this._borderColor = value;
                this.invalidateSelf();
            }
        }

        private _background: common.Background
        get background(): common.Background {
            return this._background;
        }
        set background(value: common.Background) {
            if (this._background !== value) {
                this._background = value;
                this.invalidateSelf();
            }
        }

        public draw(canvas: android.graphics.Canvas): void {
            var bounds = this.getBounds();
            var boundsF = new android.graphics.RectF(bounds);
            var boundsWidth = bounds.width();
            var boundsHeight = bounds.height();

            var radius = this._cornerRadius * this._density;
            var stroke = this._borderWidth * this._density;
           
            // set clip first
            if (radius > 0) {
                var path = new android.graphics.Path();
                path.addRoundRect(boundsF, radius, radius, android.graphics.Path.Direction.CW);
                canvas.clipPath(path);
            }

            // draw background
            if (this.background.color && this.background.color.android) {
                let c = this.background.color;
                canvas.drawARGB(c.a, c.r, c.g, c.b);
            }

            // draw image 
            if (this.background.image) {
                let bitmap = this.background.image.android;
                let params = this.background.getDrawParams(boundsWidth, boundsHeight);

                var matrix = new android.graphics.Matrix();
                if (params.sizeX > 0 && params.sizeY > 0) {
                    var scaleX = params.sizeX / bitmap.getWidth();
                    var scaleY = params.sizeY / bitmap.getHeight();
                    matrix.setScale(scaleX, scaleY, 0, 0);
                }
                else {
                    params.sizeX = bitmap.getWidth();
                    params.sizeY = bitmap.getHeight();
                }
                matrix.postTranslate(params.posX, params.posY);

                if (!params.repeatX && !params.repeatY) {
                    canvas.drawBitmap(bitmap, matrix, undefined);
                }
                else {
                    var shader = new android.graphics.BitmapShader(bitmap, android.graphics.Shader.TileMode.REPEAT, android.graphics.Shader.TileMode.REPEAT);
                    shader.setLocalMatrix(matrix);
                    var paint = new android.graphics.Paint();
                    paint.setShader(shader);

                    var w = params.repeatX ? bounds.width() : params.sizeX;
                    var h = params.repeatY ? bounds.height() : params.sizeY;

                    params.posX = params.repeatX ? 0 : params.posX;
                    params.posY = params.repeatY ? 0 : params.posY;

                    canvas.drawRect(params.posX, params.posY, params.posX + w, params.posY + h, paint);
                }
            }

            // draw border (topmost)
            if (stroke > 0 && this._borderColor && this._borderColor) {
                let borderPaint = new android.graphics.Paint();
                borderPaint.setStyle(android.graphics.Paint.Style.STROKE);
                borderPaint.setColor(this._borderColor);

                // Note: Double the stroke as the outer part will be clipped.
                borderPaint.setStrokeWidth(stroke * 2);
                canvas.drawRoundRect(boundsF, radius, radius, borderPaint)
            }
        }
    }
}

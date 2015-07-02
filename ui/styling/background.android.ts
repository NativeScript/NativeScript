import imageSource = require("image-source");
import colorModule = require("color");
import viewModule = require("ui/core/view");
import style = require("ui/styling/style");
import types = require("utils/types");
import view = require("ui/core/view");
import enums = require("ui/enums");
import utils = require("utils/utils");
import common = require("ui/styling/background-common");
import dts = require("ui/styling/background");

declare var exports;
require("utils/module-merge").merge(common, exports);

// We are using "ad" here to avoid namespace collision with the global android object
export module ad {
    export class BorderGradientDrawable extends android.graphics.drawable.GradientDrawable implements dts.ad.BorderGradientDrawable {
        private _density = utils.layout.getDisplayDensity();

        constructor() {
            super();

            return global.__native(this);
        }

        private _borderWidth: number;
        get borderWidth(): number {
            return this._borderWidth;
        }
        set borderWidth(value: number) {
            if (this._borderWidth !== value) {
                this._borderWidth = value;

                this.setStroke(this._borderWidth * this._density, this._borderColor);
            }
        }

        private _cornerRadius: number;
        get cornerRadius(): number {
            return this._cornerRadius;
        }
        set cornerRadius(value: number) {
            if (this._cornerRadius !== value) {
                this._cornerRadius = value;

                this.setCornerRadius(this._cornerRadius * this._density);
            }
        }

        private _borderColor: number;
        get borderColor(): number {
            return this._borderColor;
        }
        set borderColor(value: number) {
            if (this._borderColor !== value) {
                this._borderColor = value;

                this.setStroke(this._borderWidth * this._density, this._borderColor);
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
            super.draw(canvas);
            console.log("BorderGradientDrawable.draw()");
            var bounds = this.getBounds();
            var boundsWidth = bounds.width();
            var boundsHeight = bounds.height();

            if (this.background && !this.background.isEmpty() && boundsWidth > 0 && boundsHeight > 0) {
                var bitmap = this.background.image.android;

                var radius = this._cornerRadius * this._density;
                var stroke = this._borderWidth * this._density;
                var bounds = this.getBounds();

                // TODO: check this path
                var path = new android.graphics.Path();
                path.addRoundRect(new android.graphics.RectF(stroke, stroke, bounds.right - stroke, bounds.bottom - stroke), radius, radius, android.graphics.Path.Direction.CW);
                canvas.clipPath(path);

                if (this.background.color && this.background.color.android) {
                    var c = this.background.color;
                    canvas.drawARGB(c.a, c.r, c.g, c.b);
                }

                if (this.background.image) {
                    var params = this.background.getDrawParams(boundsWidth, boundsHeight);

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
            }
        }
    }
}

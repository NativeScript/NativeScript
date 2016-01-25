import imageSource = require("image-source");
import colorModule = require("color");
import enums = require("ui/enums");
import definition = require("ui/styling/background");
import cssValue = require("css-value");
import * as typesModule from "utils/types";

interface CSSValue {
    type: string;
    string: string;
    unit?: string;
    value?: number;
}

export class Background implements definition.Background {
    public static default = new Background(undefined, undefined, undefined, undefined, undefined);

    color: colorModule.Color;
    image: imageSource.ImageSource;
    repeat: string;
    position: string;
    size: string;

    constructor(
        color: colorModule.Color,
        image: imageSource.ImageSource,
        repeat: string,
        position: string,
        size: string) {

        this.color = color;
        this.image = image;
        this.repeat = repeat;
        this.position = position;
        this.size = size;
    }

    public withColor(value: colorModule.Color): Background {
        return new Background(value, this.image, this.repeat, this.position, this.size);
    }

    public withImage(value: imageSource.ImageSource): Background {
        return new Background(this.color, value, this.repeat, this.position, this.size);
    }

    public withRepeat(value: string): Background {
        return new Background(this.color, this.image, value, this.position, this.size);
    }

    public withPosition(value: string): Background {
        return new Background(this.color, this.image, this.repeat, value, this.size);
    }

    public withSize(value: string): Background {
        return new Background(this.color, this.image, this.repeat, this.position, value);
    }

    public getDrawParams(width: number, height: number): definition.BackgroundDrawParams {
        if (!this.image) {
            return null;
        }

        var res: definition.BackgroundDrawParams = {
            repeatX: true,
            repeatY: true,
            posX: 0,
            posY: 0,
        }

        // repeat
        if (this.repeat) {
            switch (this.repeat.toLowerCase()) {
                case enums.BackgroundRepeat.noRepeat:
                    res.repeatX = false;
                    res.repeatY = false;
                    break;

                case enums.BackgroundRepeat.repeatX:
                    res.repeatY = false;
                    break;

                case enums.BackgroundRepeat.repeatY:
                    res.repeatX = false;
                    break;
            }
        }

        var imageWidth = this.image.width;
        var imageHeight = this.image.height;

        // size
        if (this.size) {
            let values = cssValue(this.size);

            if (values.length === 2) {
                let vx = values[0];
                let vy = values[1];
                if (vx.unit === "%" && vy.unit === "%") {
                    imageWidth = width * vx.value / 100;
                    imageHeight = height * vy.value / 100;

                    res.sizeX = imageWidth;
                    res.sizeY = imageHeight;
                }
                else if (vx.type === "number" && vy.type === "number" &&
                    ((vx.unit === "px" && vy.unit === "px") || (vx.unit === "" && vy.unit === ""))) {
                    imageWidth = vx.value;
                    imageHeight = vy.value;

                    res.sizeX = imageWidth;
                    res.sizeY = imageHeight;
                }
            }
            else if (values.length === 1 && values[0].type === "ident") {
                let scale = 0;

                if (values[0].string === "cover") {
                    scale = Math.max(width / imageWidth, height / imageHeight);
                }
                else if (values[0].string === "contain") {
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
        if (this.position) {
            let v = Background.parsePosition(this.position);
            if (v) {
                let spaceX = width - imageWidth;
                let spaceY = height - imageHeight;

                if (v.x.unit === "%" && v.y.unit === "%") {
                    res.posX = spaceX * v.x.value / 100;
                    res.posY = spaceY * v.y.value / 100;
                }
                else if (v.x.type === "number" && v.y.type === "number" &&
                    ((v.x.unit === "px" && v.y.unit === "px") || (v.x.unit === "" && v.y.unit === ""))) {
                    res.posX = v.x.value;
                    res.posY = v.y.value;
                }
                else if (v.x.type === "ident" && v.y.type === "ident") {
                    if (v.x.string.toLowerCase() === "center") {
                        res.posX = spaceX / 2;
                    }
                    else if (v.x.string.toLowerCase() === "right") {
                        res.posX = spaceX;
                    }

                    if (v.y.string.toLowerCase() === "center") {
                        res.posY = spaceY / 2;
                    }
                    else if (v.y.string.toLowerCase() === "bottom") {
                        res.posY = spaceY;
                    }
                }
            }
        }

        return res;
    }

    private static parsePosition(pos: string): { x: CSSValue, y: CSSValue } {
        var res = undefined
        let values = cssValue(pos);

        if (values.length === 2) {
            return {
                x: values[0],
                y: values[1]
            };
        }

        if (values.length === 1 && values[0].type === "ident") {
            let val = values[0].string.toLocaleLowerCase();
            let center = {
                type: "ident",
                string: "center"
            };
            
            // If you only one keyword is specified, the other value is "center"
            if (val === "left" || val === "right") {
                return {
                    x: values[0],
                    y: center
                };
            }

            else if (val === "top" || val === "bottom") {
                return {
                    x: center,
                    y: values[0]
                };
            }

            else if (val === "center") {
                return {
                    x: center,
                    y: center
                };
            }
        }

        return null;
    };

    public isEmpty(): boolean {
        var types: typeof typesModule = require("utils/types");

        return types.isNullOrUndefined(this.image) && types.isNullOrUndefined(this.color);
    }

    public static equals(value1: Background, value2: Background): boolean {
        // both values are falsy
        if (!value1 && !value2) {
            return true;
        }

        // only one is falsy
        if (!value1 || !value2) {
            return false;
        }

        return value1.image === value2.image &&
            value1.position === value2.position &&
            value1.repeat === value2.repeat &&
            value1.size === value2.size &&
            colorModule.Color.equals(value1.color, value2.color);
    }
}
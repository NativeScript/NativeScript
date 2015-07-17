import imageSource = require("image-source");
import colorModule = require("color");
import types = require("utils/types");
import enums = require("ui/enums");
import dts = require("ui/styling/background");
import cssValue = require("js-libs/reworkcss-value");

export class Background implements dts.Background {
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

    public getDrawParams(width: number, height: number): dts.BackgroundDrawParams {
        if (!this.image) {
            return null;
        }

        var res: dts.BackgroundDrawParams = {
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
            let values = cssValue.parse(this.size);

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
                
                if(scale > 0){
                    imageWidth *= scale;
                    imageHeight *= scale;
                    
                    res.sizeX = imageWidth;
                    res.sizeY = imageHeight;
                }
            }
        }

        // position
        if (this.position) {
            let values = cssValue.parse(this.position);
            let spaceX = width - imageWidth;
            let spaceY = height - imageHeight;

            if (values.length === 2) {
                let vx = values[0];
                let vy = values[1];

                if (vx.unit === "%" && vy.unit === "%") {
                    res.posX = spaceX * vx.value / 100;
                    res.posY = spaceY * vy.value / 100;
                }
                else if (vx.type === "number" && vy.type === "number" &&
                    ((vx.unit === "px" && vy.unit === "px") || (vx.unit === "" && vy.unit === ""))) {
                    res.posX = vx.value;
                    res.posY = vy.value;
                }
                else if (vx.type === "ident" && vy.type === "ident") {
                    if (vx.string.toLowerCase() === "center") {
                        res.posX = spaceX / 2;
                    }
                    else if (vx.string.toLowerCase() === "right") {
                        res.posX = spaceX;
                    }

                    if (vy.string.toLowerCase() === "center") {
                        res.posY = spaceY / 2;
                    }
                    else if (vy.string.toLowerCase() === "bottom") {
                        res.posY = spaceY;
                    }
                }
            }
        }

        return res;
    }

    public isEmpty(): boolean {
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

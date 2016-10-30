export class Camera {
    static modes = {
        photo: "photo",
        video: "video"
    };

    static sources = {
        device: "device",
        library: "library",
        roll: "roll"
    };

    static getAspectSafeDimensions(sourceWidth, sourceHeight, reqWidth, reqHeight) {
        let widthCoef = sourceWidth / reqWidth;
        let heightCoef = sourceHeight / reqHeight;
        let aspectCoef = widthCoef > heightCoef ? widthCoef : heightCoef;

        return {
            width: Math.floor(sourceWidth / aspectCoef),
            height: Math.floor(sourceHeight / aspectCoef)
        };
    }

    static getMode(mode) {
        if (!mode || typeof mode != "string" || Object.keys(Camera.modes).indexOf(mode) === -1) {
            return Camera.modes.photo;
        }

        return mode;
    }

    static getSource(source) {
        if (!source || typeof source != "string" || Object.keys(Camera.sources).indexOf(source) === -1) {
            return Camera.sources.device;
        }

        return source;
    }
}
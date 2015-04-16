export function getAspectSafeDimensions(sourceWidth, sourceHeight, reqWidth, reqHeight) {
    var widthCoef = sourceWidth / reqWidth;
    var heightCoef = sourceHeight / reqHeight;

    var aspectCoef = widthCoef > heightCoef ? widthCoef : heightCoef;

    return {
        width: Math.floor(sourceWidth / aspectCoef),
        height: Math.floor(sourceHeight / aspectCoef)
    };
}
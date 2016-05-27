export function getAspectSafeDimensions(sourceWidth, sourceHeight, reqWidth, reqHeight) {
    let widthCoef = sourceWidth / reqWidth;
    let heightCoef = sourceHeight / reqHeight;

    let aspectCoef = widthCoef > heightCoef ? widthCoef : heightCoef;

    return {
        width: Math.floor(sourceWidth / aspectCoef),
        height: Math.floor(sourceHeight / aspectCoef)
    };
}
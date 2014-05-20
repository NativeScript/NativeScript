
export enum CameraPosition {
    FRONT = 0,
    BACK = 1,
}

export enum FlashMode {
    AUTO = 0,  // default
    ON = 1,
    OFF = 2
}

export interface Options {
    /**
    * Specifies which Camera to use
    */
    cameraPosition?: CameraPosition;

    /**
    * Specifies flash mode
    */
    flashMode?: FlashMode;
}

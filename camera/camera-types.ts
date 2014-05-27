
export enum CameraPosition {
    BACK = 0,
    FRONT = 1,
}

export enum FlashMode {
    OFF = -1,
    AUTO = 0,  // default
    ON = 1,
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

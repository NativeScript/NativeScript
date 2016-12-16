// >> camera-require
import * as camera from "camera";
// << camera-require

import * as TKUnit from "./TKUnit";

export var test_takePicture = function () {
    // >> camera-take-picture
    camera.takePicture().then(result => {
        // result is ImageSource
    });
    // << camera-take-picture
};

export var test_isCameraAvailable = function () {
    // >> camera-is-availabile
    var availability = camera.isAvailable();
    // << camera-is-availabile
    TKUnit.assertTrue(availability === true || availability === false, "Availability should return a Boolean");
};

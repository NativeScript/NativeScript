import camera = require("camera");

// >> camera-require
// var camera = require("camera");
// << camera-require

export var test_takePicture = function () {
    // >> camera-take-picture
    camera.takePicture().then(result => {
        //// result is ImageSource
    });
    // << camera-take-picture
};

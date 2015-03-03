import camera = require("camera");

// <snippet module="camera" title="camera">
// # Camera module
// Using a camera requires the camera module.
// ``` JavaScript
// var camera = require("camera");
// ```
// </snippet>

export var test_takePicture = function () {
    // <snippet module="camera" title="camera">
    // ### Taking a picture.
    // ``` JavaScript
    camera.takePicture().then(result => {
        //// result is ImageSource
    });
    // ```
    // </snippet>
};

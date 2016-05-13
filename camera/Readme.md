Sample usage:
```
var camera = require("camera");

camera.takePicture({"cameraPosition": camera.CameraPosition.BACK, "flashMode": camera.FlashMode.ON}).then(function (image) {
    console.log('pic taken - width: ' + image.width + ", height: " + image.height);
}).fail(function (error) {
    console.log('pic canceled');
});

if(camera.isAvailable()){
   console.log('you may take a picture');   
}
```

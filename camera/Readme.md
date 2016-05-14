Sample usage:
```
var camera = require("camera");

camera.takePicture({"width": 300, "height": 300, "keepAspectRatio": true, "saveToGallery": true}).then(function (image) {
    console.log('pic taken - width: ' + image.width + ", height: " + image.height);
}).fail(function (error) {
    console.log('pic canceled');
});

if(camera.isAvailable()){
   console.log('you may take a picture');   
}
```

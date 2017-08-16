import * as imageSource from "tns-core-modules/image-source";
// >> imagesource-from-imageasset-save-to
import * as fs from "tns-core-modules/file-system";

export function imageSourceFromAsset(imageAsset){
    let source = new imageSource.ImageSource();
     source.fromAsset(imageAsset).then((source) => {
         let folder = fs.knownFolders.documents().path;
         let fileName = "test.png"
         let path = fs.path.join(folder, fileName);
         let saved = source.saveToFile(path, "png");
         if(saved){
            console.log("saved image")
         }
     })
}
// << imagesource-from-imageasset-save-to
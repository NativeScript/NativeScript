/// <reference path="./android.d.ts" />
/// <reference path="./ios.d.ts" />

class IOSTest extends NSObject {
}

let pointer = new interop.Pointer();
console.log(pointer);

class AndroidTest extends java.lang.Object {
    public do() {
        long(12);
    }
}

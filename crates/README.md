## Rust

For building the iOS and Android packages the following targets are required

### Android

`rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android`

## Build Android

To build android only run `make android_only`

### iOS

`rustup target add aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios`

To build android only run `make ios_only`


To build both packages run `make all`
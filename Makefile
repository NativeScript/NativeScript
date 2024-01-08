ARCHS_IOS = x86_64-apple-ios aarch64-apple-ios aarch64-apple-ios-sim
ARCHS_ANDROID = i686-linux-android x86_64-linux-android aarch64-linux-android armv7-linux-androideabi
LIB = libnativescriptcore.dylib
XCFRAMEWORK = NativeScriptCore.xcframework
RUST_LIB = nativescriptcore

all:GENERATE_HEADERS ios android

ios: $(XCFRAMEWORK)

android: GENERATE_ANDROID


.PHONY: android_only
android_only: GENERATE_HEADERS android

.PHONY: ios_only
ios_only: GENERATE_HEADERS android

.PHONY: GENERATE_HEADERS
GENERATE_HEADERS:
	./tools/scripts/build-rust-headers.sh

# PHONY keyword on make means this is not a file, just an identifier for a target
.PHONY: $(ARCHS_IOS)
$(ARCHS_IOS): %:
	cargo +nightly build -Z build-std='std,panic_abort'  -Z build-std-features=panic_immediate_abort --target $@ --release -p nativescript-core

$(XCFRAMEWORK): $(ARCHS_IOS)
	rm -rf target/simulator_fat
	mkdir target/simulator_fat
	lipo -create $(wildcard target/x86_64-apple-ios/release/$(LIB)) $(wildcard target/aarch64-apple-ios-sim/release/$(LIB)) -output target/simulator_fat/$(LIB)
	xcodebuild -create-xcframework -library $(wildcard target/aarch64-apple-ios/release/$(LIB)) -headers crates/libs/nativescript-core/include -library target/simulator_fat/$(LIB) -headers crates/libs/nativescript-core/include -output target/$@ && ./tools/scripts/copy-rust-ios.sh

.PHONY: $(ARCHS_ANDROID)
$(ARCHS_ANDROID): %:
	./tools/scripts/build-rust-android.sh $@

.PHONY: GENERATE_ANDROID
GENERATE_ANDROID: $(ARCHS_ANDROID)
	./tools/scripts/copy-rust-android.sh

.PHONY: clean
clean:
	rm -rf target rm -rf $(XCFRAMEWORK) rm -rf simulator_fat/$(LIB)
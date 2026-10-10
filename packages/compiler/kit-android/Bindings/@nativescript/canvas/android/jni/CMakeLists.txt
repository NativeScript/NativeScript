# The kit's JNI layer over @nativescript/canvas's libcanvasnative.so.
# include/canvas_native.h is the plugin's own, from NativeScript/canvas @ 118c219
# (packages/canvas/src-native/canvas-android/canvas/src/main/cpp/include): the commit
# the shipped libcanvasnative.so was built from, so the declarations match its exports.
cmake_minimum_required(VERSION 3.22)
project(canvaskit C)

add_library(canvasnative SHARED IMPORTED)
# The library has no SONAME: linked by name, so the app loads it as the plugin's Java code does.
set_target_properties(canvasnative PROPERTIES IMPORTED_LOCATION ${CANVAS_NATIVE_LIBS}/${ANDROID_ABI}/libcanvasnative.so IMPORTED_NO_SONAME TRUE)

add_library(canvaskit SHARED canvas_kit.c webgpu_kit.c)
target_include_directories(canvaskit PRIVATE include)
target_link_libraries(canvaskit canvasnative log)

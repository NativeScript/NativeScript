cmake_minimum_required(VERSION 3.15.0)
set(CMAKE_VERBOSE_MAKEFILE ON)

project(nativescriptcorev8)

set(CMAKE_CXX_STANDARD 17)

## TODO
#option(ENABLE_LTO "Enable cross language linking time optimization" ON)
#if (ENABLE_LTO)
#  include(CheckIPOSupported)
#  check_ipo_supported(RESULT supported OUTPUT error)
#  if (supported)
#    message(STATUS "IPO / LTO enabled")
#    set(CMAKE_INTERPROCEDURAL_OPTIMIZATION TRUE)
#    add_link_options(-fuse-ld=lld-14)
#  else ()
#    message(STATUS "IPO / LTO not supported: <${error}>")
#  endif ()
#endif ()


set(COMMON_CMAKE_ARGUMENTS "-std=c++17 -pthread -Werror -Wno-unused-result -mstackrealign -fexceptions -fno-builtin-stpcpy -DV8_31BIT_SMIS_ON_64BIT_ARCH")


if ("${ANDROID_ABI}" MATCHES "arm64-v8a$" OR "${ANDROID_ABI}" MATCHES "x86_64$")
  # Enable pointer compression on 64 bit platforms
  set(COMMON_CMAKE_ARGUMENTS "${COMMON_CMAKE_ARGUMENTS} -DV8_COMPRESS_POINTERS")
endif ()

set(CPP_DIR ../../../core/platforms/ios/src/cpp)

include_directories(
        nativescriptcorev8

        PUBLIC

        ${PROJECT_SOURCE_DIR}/src/main/cpp/include/libc++
        ${PROJECT_SOURCE_DIR}/src/main/cpp/include
        ${PROJECT_SOURCE_DIR}/src/main/cpp
        ${PROJECT_SOURCE_DIR}/src/main/cpp/nativescriptcore
        ${PROJECT_SOURCE_DIR}/src/main/cpp/nativescriptcore/include
        ${CPP_DIR}
        ${CPP_DIR}/include
)

set(CMAKE_CXX_FLAGS ${COMMON_CMAKE_ARGUMENTS})


add_library(
        nativescriptcorev8

        SHARED
        ${CPP_DIR}/JSIRuntime.cpp
        ${CPP_DIR}/TextDecoderImpl.cpp
        ${CPP_DIR}/TextEncoderImpl.cpp
        ${CPP_DIR}/Caches.cpp
        ${CPP_DIR}/URLImpl.cpp
        ${CPP_DIR}/OneByteStringResource.cpp
        ${CPP_DIR}/CoreJSIModule.cpp

)


set_target_properties(
        nativescriptcorev8 PROPERTIES
        CXX_STANDARD 17
        CXX_EXTENSIONS OFF
        POSITION_INDEPENDENT_CODE ON
        LINK_FLAGS -Wl,--allow-multiple-definition
)


find_library(system-log log)
find_library(system-z z)

add_custom_command(TARGET nativescriptcorev8 POST_BUILD COMMAND ${CMAKE_STRIP} --strip-unneeded $<TARGET_FILE:nativescriptcorev8>)



if ("${ANDROID_ABI}" MATCHES "armeabi-v7a" OR "${ANDROID_ABI}" MATCHES "x86" AND NOT "${ANDROID_ABI}" MATCHES "x86_64")
  # On API Level 19 and lower we need to link with android_support
  # because it contains some implementation of functions such as "strtoll" and "strtoul"
  target_link_libraries(nativescriptcorev8
          ${system-log}
          ${system-z}
          ${PROJECT_SOURCE_DIR}/src/main/libs/${ANDROID_ABI}/libNativeScript.so
          ${ANDROID_NDK_ROOT}/sources/cxx-stl/llvm-libc++/libs/${ANDROID_ABI}/libandroid_support.a
          ${PROJECT_SOURCE_DIR}/src/main/jniLibs/${ANDROID_ABI}/libnativescriptcore.so
          android
          )

else ()
  target_link_libraries(nativescriptcorev8
          ${system-log}
          ${system-z}
          ${PROJECT_SOURCE_DIR}/src/main/libs/${ANDROID_ABI}/libNativeScript.so
          ${PROJECT_SOURCE_DIR}/src/main/jniLibs/${ANDROID_ABI}/libnativescriptcore.so
          android
          )
endif ()


#add_custom_command(TARGET nativescriptcorev8
#        PRE_BUILD
#        COMMAND ${CMAKE_COMMAND} -E copy
#        ${PROJECT_SOURCE_DIR}/src/main/jniLibs/${ANDROID_ABI}/libnativescriptcore.so
#        ${CMAKE_LIBRARY_OUTPUT_DIRECTORY}/libnativescriptcore.so
#        )
#

Pod::Spec.new do |s|
    s.name         = "NativeScript"
    s.version      = '1.0.0'
    s.summary      = "description"
    s.license      = "MIT"

    s.authors      = "Ammar Ahmed"
    s.homepage     = "https://github.com/ammarahm-ed/nativescript-v8-module"
    s.platforms    = { :ios => "12.4" }
    s.source       = { :git => "https://github.com/ammarahm-ed/nativescript-v8-module.git", :tag => "v1.0.0" }
    s.cocoapods_version      = ">= 1.10.1"
    s.vendored_frameworks = "NativeScript.xcframework"

    s.subspec 'runtime' do |ss|
      ss.xcconfig = { 'USER_HEADER_SEARCH_PATHS' => '"${PODS_SRC_ROOT}/Headers/runtime/**/*.{h}' }
      ss.source_files               = "Headers/runtime/**/*.h"
      ss.header_dir = "runtime"
    end

    s.subspec 'include' do |ss|
      ss.xcconfig = { 'USER_HEADER_SEARCH_PATHS' => '"${PODS_SRC_ROOT}/Headers/include/**/*.{h}' }
      ss.source_files               = "Headers/include/*.h"
    end

    s.subspec 'cppgc' do |ss|
      ss.xcconfig = { 'USER_HEADER_SEARCH_PATHS' => '"${PODS_SRC_ROOT}/Headers/include/cppgc/*.{h}' }
      ss.source_files               = "Headers/include/cppgc/*.h"
      ss.header_dir = "cppgc"
    end

    s.subspec 'inspector' do |ss|
      ss.xcconfig = { 'USER_HEADER_SEARCH_PATHS' => '"${PODS_SRC_ROOT}/Headers/include/inspector/*.{h}' }
      ss.source_files               = "Headers/include/inspector/*.h"
      ss.header_dir = "inspector"
    end

    s.subspec 'libffix86' do |ss|
      ss.xcconfig = { 'USER_HEADER_SEARCH_PATHS' => '"${PODS_SRC_ROOT}/Headers/include/libffi/x86_64/*.{h}' }
      ss.source_files               = "Headers/include/libffi/x86_64/*.h"
      ss.header_dir = "libffi/x86_64"
    end

    s.subspec 'libffiarm' do |ss|
      ss.xcconfig = { 'USER_HEADER_SEARCH_PATHS' => '"${PODS_SRC_ROOT}/Headers/include/libffi/arm64/*.{h}' }
      ss.source_files               = "Headers/include/libffi/arm64/*.h"
      ss.header_dir = "libffi/arm64"
    end

    s.subspec 'libplatform' do |ss|
      ss.xcconfig = { 'USER_HEADER_SEARCH_PATHS' => '"${PODS_SRC_ROOT}/Headers/include/libplatform/*.{h}' }
      ss.source_files               = "Headers/include/libplatform/*.h"
      ss.header_dir = "libplatform"
    end

  end

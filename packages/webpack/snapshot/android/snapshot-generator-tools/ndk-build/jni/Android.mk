LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)
LOCAL_MODULE := snapshot
LOCAL_SRC_FILES := $(TARGET_ARCH_ABI)/TNSSnapshot.c
include $(BUILD_SHARED_LIBRARY)


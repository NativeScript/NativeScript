#ifndef ffi_h
#define ffi_h

#if defined __arm64 && __arm64__
#include "libffi/arm64/ffi.h"
#elif defined __x86_64__ && __x86_64__
#include "libffi/x86_64/ffi.h"
#else
#error Unknown CPU architecture. Only ARM64 and X86_64 architectures are supported
#endif

#endif /* ffi_h */

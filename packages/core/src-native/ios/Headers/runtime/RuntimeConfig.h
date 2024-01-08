#ifndef RuntimeConfig_h
#define RuntimeConfig_h

#include <sys/types.h>
#include <string>

struct RuntimeConfig {
    std::string BaseDir;
    std::string ApplicationPath;
    void* MetadataPtr;
    bool IsDebug;
    bool LogToSystemConsole;
};

extern struct RuntimeConfig RuntimeConfig;

#endif /* RuntimeConfig_h */

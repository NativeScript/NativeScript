#ifndef ConcurrentQueue_h
#define ConcurrentQueue_h

#include <CoreFoundation/CoreFoundation.h>
#include <vector>
#include <string>
#include <queue>
#include <mutex>

namespace tns {

struct ConcurrentQueue {
public:
    void Initialize(CFRunLoopRef runLoop, void (*performWork)(void*), void* info);
    void Push(std::string message);
    std::vector<std::string> PopAll();
    void Terminate();
private:
    std::queue<std::string> messagesQueue_;
    CFRunLoopSourceRef runLoopTasksSource_ = nullptr;
    CFRunLoopRef runLoop_ = nullptr;
    bool terminated = false;
    std::mutex mutex_;
    std::mutex initializationMutex_;
    void SignalAndWakeUp();
};

}

#endif /* ConcurrentQueue_h */

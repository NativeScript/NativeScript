#ifndef InspectorServer_h
#define InspectorServer_h

#include <functional>
#include <string>
#include <sys/types.h>
#include <dispatch/dispatch.h>

namespace v8_inspector {

class InspectorServer {
public:
    static in_port_t Init(std::function<void (std::function<void (std::string)>)> onClientConnected, std::function<void (std::string)> onMessage);
private:
    static void Send(dispatch_io_t channel, dispatch_queue_t queue, std::string message);
};

}

#endif /* InspectorServer_h */

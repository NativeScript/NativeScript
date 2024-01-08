//
//  ns-v8-tracing-agent-impl.hpp
//  NativeScript
//
//  Created by Igor Randjelovic on 2023. 04. 03..
//  Copyright © 2023. Progress. All rights reserved.
//

#ifndef ns_v8_tracing_agent_impl_hpp
#define ns_v8_tracing_agent_impl_hpp

#include <stdio.h>

#include "libplatform/v8-tracing.h"
#include "v8.h"

namespace tns {
namespace inspector {

using v8::platform::tracing::TraceBuffer;
using v8::platform::tracing::TraceBufferChunk;
using v8::platform::tracing::TraceWriter;
using v8::platform::tracing::TraceObject;
using v8::platform::tracing::TracingController;
using v8::platform::tracing::TraceConfig;

class NSInMemoryTraceWriter: public TraceWriter {
public:
    NSInMemoryTraceWriter(): stream_() {};
    void AppendTraceEvent(TraceObject *trace_event);
    void Flush();
    std::string getTrace();
private:
    int total_traces_ = 0;
    std::stringstream stream_;
    std::unique_ptr<TraceWriter> json_trace_writer_;
};

class TracingAgentImpl {
public:
    TracingAgentImpl();
    bool start();
    bool end();
    std::string getLastTrace() {
        return lastTrace_;
    }
    void SendToDevtools(v8::Local<v8::Context> context, std::string jsonData);
private:
    bool tracing_ = false;
    TracingController* tracing_controller_;
    NSInMemoryTraceWriter* current_trace_writer_;
    
    std::string lastTrace_;
};

} // namespace inspector
} // namespace tns


#endif /* ns_v8_tracing_agent_impl_hpp */

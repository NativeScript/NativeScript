//
// Created by Osei Fortune on 10/06/2022.
//

#include "Caches.h"

std::shared_ptr <ConcurrentMap<v8::Isolate *, std::shared_ptr < Caches>>>
Caches::perIsolateCaches_ = std::make_shared < ConcurrentMap<v8::Isolate *, std::shared_ptr < Caches>>
>();

Caches::Caches(v8::Isolate *isolate) : isolate_(isolate) {}

Caches::~Caches() {}

std::shared_ptr <Caches> Caches::Get(v8::Isolate *isolate) {
    std::shared_ptr <Caches> cache = Caches::perIsolateCaches_->Get(isolate);
    if (cache == nullptr) {
        cache = std::make_shared<Caches>(isolate);
        Caches::perIsolateCaches_->Insert(isolate, cache);
    }

    return cache;
}

void Caches::Remove(v8::Isolate *isolate) {
    Caches::perIsolateCaches_->Remove(isolate);
}

void Caches::SetContext(v8::Local<v8::Context> context) {
    this->context_ = std::make_shared<v8::Persistent<v8::Context >>(this->isolate_, context);
}

v8::Local<v8::Context> Caches::GetContext() {
    return this->context_->Get(this->isolate_);
}

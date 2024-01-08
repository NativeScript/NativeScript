//
// Created by Osei Fortune on 07/01/2024.
//

#include "URLImpl.h"
#include "Caches.h"
#include "Helpers.h"
#include "OneByteStringResource.h"

URLImpl::URLImpl(URL *url) : url_(url) {}

void URLImpl::Init(const v8::Local<v8::Object> &canvasModule, v8::Isolate *isolate) {
    v8::Locker locker(isolate);
    v8::Isolate::Scope isolate_scope(isolate);
    v8::HandleScope handle_scope(isolate);

    auto ctor = GetCtor(isolate);
    auto context = isolate->GetCurrentContext();
    auto func = ctor->GetFunction(context).ToLocalChecked();

    canvasModule->Set(context, ConvertToV8String(isolate, "URL"), func);
}

URLImpl *URLImpl::GetPointer(v8::Local<v8::Object> object) {
    auto ptr = object->GetInternalField(0).As<v8::External>()->Value();
    if (ptr == nullptr) {
        return nullptr;
    }
    return static_cast<URLImpl *>(ptr);
}

URL *URLImpl::GetURL() {
    return this->url_;
}

v8::Local<v8::FunctionTemplate> URLImpl::GetCtor(v8::Isolate *isolate) {
    auto cache = Caches::Get(isolate);
    auto ctor = cache->URLTmpl.get();
    if (ctor != nullptr) {
        return ctor->Get(isolate);
    }

    v8::Local<v8::FunctionTemplate> ctorTmpl = v8::FunctionTemplate::New(isolate, Ctor);
    ctorTmpl->InstanceTemplate()->SetInternalFieldCount(1);
    ctorTmpl->SetClassName(ConvertToV8String(isolate, "URL"));

    auto tmpl = ctorTmpl->InstanceTemplate();
    tmpl->SetInternalFieldCount(1);
    tmpl->SetAccessor(
            ConvertToV8String(isolate, "hash"),
            GetHash, SetHash);
    tmpl->SetAccessor(
            ConvertToV8String(isolate, "host"),
            GetHost, SetHost);
    tmpl->SetAccessor(
            ConvertToV8String(isolate, "hostname"),
            GetHostName, SetHostName);
    tmpl->SetAccessor(
            ConvertToV8String(isolate, "href"),
            GetHref, SetHref);

    tmpl->SetAccessor(
            ConvertToV8String(isolate, "origin"),
            GetOrigin);

    tmpl->SetAccessor(
            ConvertToV8String(isolate, "password"),
            GetPassword, SetPassword);

    tmpl->SetAccessor(
            ConvertToV8String(isolate, "pathname"),
            GetPathName, SetPathName);

    tmpl->SetAccessor(
            ConvertToV8String(isolate, "port"),
            GetPort, SetPort);

    tmpl->SetAccessor(
            ConvertToV8String(isolate, "protocol"),
            GetProtocol, SetProtocol);

    tmpl->SetAccessor(
            ConvertToV8String(isolate, "search"),
            GetSearch, SetSearch);

    tmpl->SetAccessor(
            ConvertToV8String(isolate, "username"),
            GetUserName, SetUserName);

    tmpl->Set(ConvertToV8String(isolate, "toString"),
              v8::FunctionTemplate::New(isolate, &ToString));


    ctorTmpl->Set(ConvertToV8String(isolate, "canParse"),
                  v8::FunctionTemplate::New(isolate, &CanParse));

    cache->URLTmpl =
            std::make_unique<v8::Persistent<v8::FunctionTemplate>>(isolate, ctorTmpl);
    return ctorTmpl;
}

void URLImpl::Ctor(const v8::FunctionCallbackInfo<v8::Value> &args) {
    auto count = args.Length();
    auto value = args[0];
    auto isolate = args.GetIsolate();
    if (count >= 1 && !value->IsString()) {
        isolate->ThrowException(v8::Exception::TypeError(ConvertToV8String(isolate, "")));
        return;
    }


    URL *url;

    if (count > 1) {
        url = nativescript_core_url_create(ConvertFromV8String(isolate, args[0]).c_str(),
                                           ConvertFromV8String(isolate, args[1]).c_str());
    } else {
        url = nativescript_core_url_create(ConvertFromV8String(isolate, args[0]).c_str(), nullptr);
    }

    auto ret = args.This();

    auto decoder = new URLImpl(url);

    auto ext = v8::External::New(isolate, decoder);

    ret->SetInternalField(0, ext);

    args.GetReturnValue().Set(ret);

}


void URLImpl::GetHash(v8::Local<v8::String> property,
                      const v8::PropertyCallbackInfo<v8::Value> &info) {
    URLImpl *ptr = GetPointer(info.This());
    if (ptr == nullptr) {
        info.GetReturnValue().SetEmptyString();
        return;
    }
    auto isolate = info.GetIsolate();

    auto value = nativescript_core_url_hash(ptr->GetURL());
    info.GetReturnValue().Set(ConvertToV8String(isolate, value));
    nativescript_core_string_destroy((char *) value);

}

void URLImpl::SetHash(v8::Local<v8::String> property,
                      v8::Local<v8::Value> value,
                      const v8::PropertyCallbackInfo<void> &info) {
    URLImpl *ptr = GetPointer(info.This());
    if (ptr == nullptr) {
        return;
    }
    auto isolate = info.GetIsolate();
    auto context = isolate->GetCurrentContext();
    auto val = ConvertFromV8String(isolate, value->ToString(context).ToLocalChecked());
    nativescript_core_url_set_hash(ptr->GetURL(), val.c_str());
}


void URLImpl::GetHost(v8::Local<v8::String> property,
                      const v8::PropertyCallbackInfo<v8::Value> &info) {
    URLImpl *ptr = GetPointer(info.This());
    if (ptr == nullptr) {
        info.GetReturnValue().SetEmptyString();
        return;
    }
    auto isolate = info.GetIsolate();

    auto value = nativescript_core_url_host(ptr->GetURL());
    info.GetReturnValue().Set(ConvertToV8String(isolate, value));
    nativescript_core_string_destroy((char *) value);

}

void URLImpl::SetHost(v8::Local<v8::String> property,
                      v8::Local<v8::Value> value,
                      const v8::PropertyCallbackInfo<void> &info) {
    URLImpl *ptr = GetPointer(info.This());
    if (ptr == nullptr) {
        return;
    }
    auto isolate = info.GetIsolate();
    auto context = isolate->GetCurrentContext();
    auto val = ConvertFromV8String(isolate, value->ToString(context).ToLocalChecked());
    nativescript_core_url_set_host(ptr->GetURL(), val.c_str());
}


void URLImpl::GetHostName(v8::Local<v8::String> property,
                          const v8::PropertyCallbackInfo<v8::Value> &info) {
    URLImpl *ptr = GetPointer(info.This());
    if (ptr == nullptr) {
        info.GetReturnValue().SetEmptyString();
        return;
    }
    auto isolate = info.GetIsolate();

    auto value = nativescript_core_url_host_name(ptr->GetURL());
    info.GetReturnValue().Set(ConvertToV8String(isolate, value));
    nativescript_core_string_destroy((char *) value);

}

void URLImpl::SetHostName(v8::Local<v8::String> property,
                          v8::Local<v8::Value> value,
                          const v8::PropertyCallbackInfo<void> &info) {
    URLImpl *ptr = GetPointer(info.This());
    if (ptr == nullptr) {
        return;
    }
    auto isolate = info.GetIsolate();
    auto context = isolate->GetCurrentContext();
    auto val = ConvertFromV8String(isolate, value->ToString(context).ToLocalChecked());
    nativescript_core_url_set_host_name(ptr->GetURL(), val.c_str());
}


void URLImpl::GetHref(v8::Local<v8::String> property,
                      const v8::PropertyCallbackInfo<v8::Value> &info) {
    URLImpl *ptr = GetPointer(info.This());
    if (ptr == nullptr) {
        info.GetReturnValue().SetEmptyString();
        return;
    }
    auto isolate = info.GetIsolate();

    auto value = nativescript_core_url_href(ptr->GetURL());
    info.GetReturnValue().Set(ConvertToV8String(isolate, value));
    nativescript_core_string_destroy((char *) value);

}

void URLImpl::SetHref(v8::Local<v8::String> property,
                      v8::Local<v8::Value> value,
                      const v8::PropertyCallbackInfo<void> &info) {
    URLImpl *ptr = GetPointer(info.This());
    if (ptr == nullptr) {
        return;
    }
    auto isolate = info.GetIsolate();
    auto context = isolate->GetCurrentContext();
    auto val = ConvertFromV8String(isolate, value->ToString(context).ToLocalChecked());
    nativescript_core_url_set_href(ptr->GetURL(), val.c_str());
}

void URLImpl::GetOrigin(v8::Local<v8::String> property,
                        const v8::PropertyCallbackInfo<v8::Value> &info) {
    URLImpl *ptr = GetPointer(info.This());
    if (ptr == nullptr) {
        info.GetReturnValue().SetEmptyString();
        return;
    }
    auto isolate = info.GetIsolate();

    auto value = nativescript_core_url_origin(ptr->GetURL());
    info.GetReturnValue().Set(ConvertToV8String(isolate, value));
    nativescript_core_string_destroy((char *) value);

}

void URLImpl::GetPassword(v8::Local<v8::String> property,
                          const v8::PropertyCallbackInfo<v8::Value> &info) {
    URLImpl *ptr = GetPointer(info.This());
    if (ptr == nullptr) {
        info.GetReturnValue().SetEmptyString();
        return;
    }
    auto isolate = info.GetIsolate();

    auto value = nativescript_core_url_password(ptr->GetURL());
    info.GetReturnValue().Set(ConvertToV8String(isolate, value));
    nativescript_core_string_destroy((char *) value);

}

void URLImpl::SetPassword(v8::Local<v8::String> property,
                          v8::Local<v8::Value> value,
                          const v8::PropertyCallbackInfo<void> &info) {
    URLImpl *ptr = GetPointer(info.This());
    if (ptr == nullptr) {
        return;
    }
    auto isolate = info.GetIsolate();
    auto context = isolate->GetCurrentContext();
    auto val = ConvertFromV8String(isolate, value->ToString(context).ToLocalChecked());
    nativescript_core_url_set_password(ptr->GetURL(), val.c_str());
}

void URLImpl::GetPathName(v8::Local<v8::String> property,
                          const v8::PropertyCallbackInfo<v8::Value> &info) {
    URLImpl *ptr = GetPointer(info.This());
    if (ptr == nullptr) {
        info.GetReturnValue().SetEmptyString();
        return;
    }
    auto isolate = info.GetIsolate();

    auto value = nativescript_core_url_pathname(ptr->GetURL());
    info.GetReturnValue().Set(ConvertToV8String(isolate, value));
    nativescript_core_string_destroy((char *) value);

}

void URLImpl::SetPathName(v8::Local<v8::String> property,
                          v8::Local<v8::Value> value,
                          const v8::PropertyCallbackInfo<void> &info) {
    URLImpl *ptr = GetPointer(info.This());
    if (ptr == nullptr) {
        return;
    }
    auto isolate = info.GetIsolate();
    auto context = isolate->GetCurrentContext();
    auto val = ConvertFromV8String(isolate, value->ToString(context).ToLocalChecked());
    nativescript_core_url_set_pathname(ptr->GetURL(), val.c_str());
}

void URLImpl::GetPort(v8::Local<v8::String> property,
                      const v8::PropertyCallbackInfo<v8::Value> &info) {
    URLImpl *ptr = GetPointer(info.This());
    if (ptr == nullptr) {
        info.GetReturnValue().SetEmptyString();
        return;
    }
    auto isolate = info.GetIsolate();

    auto value = nativescript_core_url_port(ptr->GetURL());
    info.GetReturnValue().Set(ConvertToV8String(isolate, value));
    nativescript_core_string_destroy((char *) value);

}

void URLImpl::SetPort(v8::Local<v8::String> property,
                      v8::Local<v8::Value> value,
                      const v8::PropertyCallbackInfo<void> &info) {
    URLImpl *ptr = GetPointer(info.This());
    if (ptr == nullptr) {
        return;
    }
    auto isolate = info.GetIsolate();
    auto context = isolate->GetCurrentContext();
    auto val = ConvertFromV8String(isolate, value->ToString(context).ToLocalChecked());
    nativescript_core_url_set_port(ptr->GetURL(), val.c_str());
}

void URLImpl::GetProtocol(v8::Local<v8::String> property,
                          const v8::PropertyCallbackInfo<v8::Value> &info) {
    URLImpl *ptr = GetPointer(info.This());
    if (ptr == nullptr) {
        info.GetReturnValue().SetEmptyString();
        return;
    }
    auto isolate = info.GetIsolate();

    auto value = nativescript_core_url_protocol(ptr->GetURL());
    info.GetReturnValue().Set(ConvertToV8String(isolate, value));
    nativescript_core_string_destroy((char *) value);

}

void URLImpl::SetProtocol(v8::Local<v8::String> property,
                          v8::Local<v8::Value> value,
                          const v8::PropertyCallbackInfo<void> &info) {
    URLImpl *ptr = GetPointer(info.This());
    if (ptr == nullptr) {
        return;
    }
    auto isolate = info.GetIsolate();
    auto context = isolate->GetCurrentContext();
    auto val = ConvertFromV8String(isolate, value->ToString(context).ToLocalChecked());
    nativescript_core_url_set_protocol(ptr->GetURL(), val.c_str());
}


void URLImpl::GetSearch(v8::Local<v8::String> property,
                        const v8::PropertyCallbackInfo<v8::Value> &info) {
    URLImpl *ptr = GetPointer(info.This());
    if (ptr == nullptr) {
        info.GetReturnValue().SetEmptyString();
        return;
    }
    auto isolate = info.GetIsolate();

    auto value = nativescript_core_url_search(ptr->GetURL());
    info.GetReturnValue().Set(ConvertToV8String(isolate, value));
    nativescript_core_string_destroy((char *) value);

}

void URLImpl::SetSearch(v8::Local<v8::String> property,
                        v8::Local<v8::Value> value,
                        const v8::PropertyCallbackInfo<void> &info) {
    URLImpl *ptr = GetPointer(info.This());
    if (ptr == nullptr) {
        return;
    }
    auto isolate = info.GetIsolate();
    auto context = isolate->GetCurrentContext();
    auto val = ConvertFromV8String(isolate, value->ToString(context).ToLocalChecked());
    nativescript_core_url_set_search(ptr->GetURL(), val.c_str());
}


void URLImpl::GetUserName(v8::Local<v8::String> property,
                          const v8::PropertyCallbackInfo<v8::Value> &info) {
    URLImpl *ptr = GetPointer(info.This());
    if (ptr == nullptr) {
        info.GetReturnValue().SetEmptyString();
        return;
    }
    auto isolate = info.GetIsolate();

    auto value = nativescript_core_url_username(ptr->GetURL());
    info.GetReturnValue().Set(ConvertToV8String(isolate, value));
    nativescript_core_string_destroy((char *) value);

}

void URLImpl::SetUserName(v8::Local<v8::String> property,
                          v8::Local<v8::Value> value,
                          const v8::PropertyCallbackInfo<void> &info) {
    URLImpl *ptr = GetPointer(info.This());
    if (ptr == nullptr) {
        return;
    }
    auto isolate = info.GetIsolate();
    auto context = isolate->GetCurrentContext();
    auto val = ConvertFromV8String(isolate, value->ToString(context).ToLocalChecked());
    nativescript_core_url_set_username(ptr->GetURL(), val.c_str());
}


void URLImpl::ToString(const v8::FunctionCallbackInfo<v8::Value> &args) {
    URLImpl *ptr = GetPointer(args.This());
    if (ptr == nullptr) {
        args.GetReturnValue().SetEmptyString();
        return;
    }
    auto isolate = args.GetIsolate();

    auto value = nativescript_core_url_to_string(ptr->GetURL());

    auto returnValue = new OneByteStringResource(value);
    auto ret = v8::String::NewExternalOneByte(isolate, returnValue);
    args.GetReturnValue().Set(ret.ToLocalChecked());
}


void URLImpl::CanParse(const v8::FunctionCallbackInfo<v8::Value> &args) {
    auto isolate = args.GetIsolate();
    bool value;
    auto count = args.Length();

    if (count > 1) {
        value = nativescript_core_url_can_parse(ConvertFromV8String(isolate, args[0]).c_str(),
                                                ConvertFromV8String(isolate, args[1]).c_str());
    } else {
        value = nativescript_core_url_can_parse(ConvertFromV8String(isolate, args[0]).c_str(),
                                                nullptr);
    }

    args.GetReturnValue().Set(value);
}

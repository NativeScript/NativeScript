#ifndef SymbolLoader_h
#define SymbolLoader_h

#include "robin_hood.h"
#include "Metadata.h"

namespace tns {

class SymbolResolver;

class SymbolLoader {
public:
    static SymbolLoader& instance();

    void* loadFunctionSymbol(const ModuleMeta*, const char* symbolName);
    void* loadDataSymbol(const ModuleMeta*, const char* symbolName);
    bool ensureModule(const ModuleMeta*);

private:
    SymbolResolver* resolveModule(const ModuleMeta*);

    robin_hood::unordered_map<const ModuleMeta*, std::unique_ptr<SymbolResolver>> _cache;
};

}

#endif /* SymbolLoader_h */

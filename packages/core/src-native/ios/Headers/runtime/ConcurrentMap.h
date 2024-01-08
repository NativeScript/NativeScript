#ifndef ConcurrentMap_h
#define ConcurrentMap_h

#include <shared_mutex>
#include "robin_hood.h"

namespace tns {

template<class TKey, class TValue>
class ConcurrentMap {
public:
    inline void Insert(TKey& key, TValue value) {
        std::lock_guard<std::mutex> writerLock(this->containerMutex_);
        this->container_[key] = value;
    }

    inline TValue Get(TKey& key) {
        bool found;
        return this->Get(key, found);
    }

    inline TValue Get(TKey& key, bool& found) {
        std::lock_guard<std::mutex> writerLock(this->containerMutex_);
        auto it = this->container_.find(key);
        found = it != this->container_.end();
        if (found) {
            return it->second;
        }
        return nullptr;
    }

    inline bool ContainsKey(TKey& key) {
        std::lock_guard<std::mutex> writerLock(this->containerMutex_);
        auto it = this->container_.find(key);
        return it != this->container_.end();
    }

    inline void Remove(TKey& key) {
        std::lock_guard<std::mutex> writerLock(this->containerMutex_);
        this->container_.erase(key);
    }

    inline void ForEach(const std::function<bool(TKey&, TValue&)>& func) {
        std::lock_guard<std::mutex> writerLock(this->containerMutex_);
        for(auto i : this->container_) {
            if(func(i.first, i.second)) {
                break;
            }
        }
    }

    ConcurrentMap() = default;
    ConcurrentMap(const ConcurrentMap&) = delete;
    ConcurrentMap& operator=(const ConcurrentMap&) = delete;
private:
    std::mutex containerMutex_;
    robin_hood::unordered_map<TKey, TValue> container_;
};

}

#endif /* ConcurrentMap_h */

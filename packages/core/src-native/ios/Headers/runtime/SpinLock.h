#ifndef SpinLock_h
#define SpinLock_h


/**
 WARNING:
 Do NOT use this.
 More ofthen than not a normal mutex is better and this spinlock is really unfair in multi threading
 This is only supposed to be used in places where the function is very fast and the expected concurrency is very low
 If any of those things are false, this WILL be slower and worse than a mutex or a read write mutex
 
 The only place this is currently used is for caching selectors, which take ns to run and are not locked to a specific isolate.
 */

struct SpinMutex {
  std::atomic<bool> lock_ = {0};

  inline void lock() noexcept {
    for (;;) {
      // Optimistically assume the lock is free on the first try
      if (!lock_.exchange(true, std::memory_order_acquire)) {
        return;
      }
      // Wait for lock to be released without generating cache misses
      while (lock_.load(std::memory_order_relaxed)) {
        // Issue X86 PAUSE or ARM YIELD instruction to reduce contention between
        // hyper-threads
        //__builtin_ia32_pause();
      }
    }
  }

  bool try_lock() noexcept {
    // First do a relaxed load to check if lock is free in order to prevent
    // unnecessary cache misses if someone does while(!try_lock())
    return !lock_.load(std::memory_order_relaxed) &&
           !lock_.exchange(true, std::memory_order_acquire);
  }

  inline void unlock() noexcept {
    lock_.store(false, std::memory_order_release);
  }
};

struct SpinLock {
    SpinMutex& _mutex;
    SpinLock(SpinMutex& m) : _mutex(m) {
        _mutex.lock();
    }
    ~SpinLock() {
        _mutex.unlock();
    }
};


#endif /* SpinLock_h */

#ifndef KnownUnknownClassPair_h
#define KnownUnknownClassPair_h

#include <objc/objc.h>

namespace tns {

struct KnownUnknownClassPair {
    Class known;
    Class unknown;

    explicit KnownUnknownClassPair(Class known = nullptr, Class unknown = nullptr)
        : known(known)
        , unknown(unknown) {
    }

    Class realClass() const {
        return unknown ? unknown : known;
    }

    bool operator<(const KnownUnknownClassPair& other) const {
        return known < other.known || (known == other.known && unknown < other.unknown);
    }

    bool operator==(const KnownUnknownClassPair& other) const {
        return known == other.known && unknown == other.unknown;
    }

    static const KnownUnknownClassPair& EmptyValue();
    static const KnownUnknownClassPair& DeletedValue();
};

} // namespace tns

#endif /* KnownUnknownClassPair_h */

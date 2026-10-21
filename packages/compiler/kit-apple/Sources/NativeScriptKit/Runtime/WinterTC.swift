import Foundation
import CryptoKit
import Security

// The web globals NativeScript's runtime gives every app (WinterTC's minimum common API):
// atob and btoa, TextEncoder and TextDecoder, and crypto with its SubtleCrypto.

/// `DOMException`: an error the web's APIs throw, told apart by its name.
public final class JSDOMException: JSError {
    nonisolated deinit {}
    public init(_ message: String, name: String) {
        super.init(message)
        self.name = name
    }
}

/// `new DOMException(message, name)` on the global object.
let jsDOMExceptionConstructor = JSConstructor { arguments in
    let message = jsArg(arguments, 0), name = jsArg(arguments, 1)
    return JSDOMException(message == nil ? "" : jsToString(message), name: name == nil ? "Error" : jsToString(name))
}

private func domException(_ name: String, _ message: String) -> JSException {
    JSException(JSDOMException(message, name: name))
}

// MARK: - Base64

/// `btoa(data)`: each character a byte, so one above U+00FF has no encoding.
public func jsBtoa(_ data: String) throws -> String {
    var bytes: [UInt8] = []
    bytes.reserveCapacity(data.utf16.count)
    for unit in data.utf16 {
        guard unit <= 0xFF else { throw domException("InvalidCharacterError", "Invalid character") }
        bytes.append(UInt8(unit))
    }
    return Data(bytes).base64EncodedString()
}

/// `atob(data)`: forgiving-base64 decode (HTML §8.3), each byte one character of the result.
public func jsAtob(_ data: String) throws -> String {
    let invalid = domException("InvalidCharacterError", "The string to be decoded is not correctly encoded.")
    var units = data.utf16.filter { ![0x09, 0x0A, 0x0C, 0x0D, 0x20].contains($0) }
    if units.count % 4 == 0 {
        if units.last == 0x3D { units.removeLast() }
        if units.last == 0x3D { units.removeLast() }
    }
    if units.count % 4 == 1 { throw invalid }
    var bytes: [UInt8] = []
    bytes.reserveCapacity(units.count * 3 / 4)
    var buffer: UInt32 = 0
    var bits = 0
    for unit in units {
        let value: UInt32
        switch unit {
        case 0x41...0x5A: value = UInt32(unit - 0x41)
        case 0x61...0x7A: value = UInt32(unit - 0x61 + 26)
        case 0x30...0x39: value = UInt32(unit - 0x30 + 52)
        case 0x2B: value = 62
        case 0x2F: value = 63
        default: throw invalid
        }
        buffer = buffer << 6 | value
        bits += 6
        if bits >= 8 {
            bits -= 8
            bytes.append(UInt8(truncatingIfNeeded: buffer >> UInt32(bits)))
        }
    }
    return String(decoding: bytes.map { UInt16($0) }, as: UTF16.self)
}

// MARK: - Text encoding

/// `TextEncoder`: strings to UTF-8.
public final class JSTextEncoder: JSDynamic {
    nonisolated deinit {}
    public init() {}

    public var encoding: String { "utf-8" }

    public func encode(_ input: String? = nil) -> JSUint8Array {
        let data = Data((input ?? "").utf8)
        return JSUint8Array(buffer: JSArrayBuffer(data: data), offset: 0, count: data.count)
    }

    public subscript(jsKey key: String) -> Any? {
        get { key == "encoding" ? encoding : nil }
        set {}
    }
    public var jsKeys: [String] { [] }
    public var jsClassName: String? { "TextEncoder" }
}

/// `TextDecoder`: UTF-8 to strings, the only encoding NativeScript's runtime decodes.
public final class JSTextDecoder: JSDynamic {
    nonisolated deinit {}
    public let fatal: Bool
    public let ignoreBOM: Bool

    public init(_ label: String? = nil, _ options: Any? = nil) {
        fatal = jsIsTruthy(jsField(options, "fatal"))
        ignoreBOM = jsIsTruthy(jsField(options, "ignoreBOM"))
    }

    public var encoding: String { "utf-8" }

    public func decode(_ input: Any? = nil) throws -> String {
        guard let value = jsFlat(input) else { return "" }
        guard let source = value as? JSBufferSource else {
            throw JSException(JSTypeError("The \"input\" argument must be an instance of ArrayBuffer or ArrayBufferView."))
        }
        var bytes = UnsafeRawBufferPointer(source.jsBytes)
        if !ignoreBOM && bytes.starts(with: [0xEF, 0xBB, 0xBF]) { bytes = UnsafeRawBufferPointer(rebasing: bytes[3...]) }
        // Not String(bytes:encoding:), which drops a BOM that ignoreBOM keeps.
        if fatal && transcode(bytes.makeIterator(), from: UTF8.self, to: UTF8.self, stoppingOnError: true, into: { _ in }) {
            throw JSException(JSTypeError("The encoded data was not valid for encoding utf-8"))
        }
        return String(decoding: bytes, as: UTF8.self)
    }

    public subscript(jsKey key: String) -> Any? {
        get {
            switch key {
            case "encoding": return encoding
            case "fatal": return fatal
            case "ignoreBOM": return ignoreBOM
            default: return nil
            }
        }
        set {}
    }
    public var jsKeys: [String] { [] }
    public var jsClassName: String? { "TextDecoder" }
}

// MARK: - Crypto

/// `crypto`, the global.
public let crypto = JSCrypto()

/// `Crypto`: random values and the subtle API.
public final class JSCrypto: JSDynamic, @unchecked Sendable {
    nonisolated deinit {}
    public let subtle = JSSubtleCrypto()

    public func randomUUID() -> String { UUID().uuidString.lowercased() }

    /// Fills an integer typed array with random bytes and returns it; at most 65536 bytes a call.
    public func getRandomValues<T>(_ array: T) throws -> T {
        guard let view = jsFlat(array) as? JSArrayBufferView else {
            throw JSException(JSTypeError("The \"typedArray\" argument must be an instance of ArrayBufferView."))
        }
        guard let kind = view.jsElementKind, kind != .float32, kind != .float64 else {
            throw domException("TypeMismatchError", "The data argument must be an integer-type TypedArray")
        }
        let bytes = view.jsBytes
        guard bytes.count <= 65536 else {
            throw domException("QuotaExceededError", "The ArrayBufferView's byte length (\(bytes.count)) exceeds the number of bytes of entropy available via this API (65536)")
        }
        if let base = bytes.baseAddress, SecRandomCopyBytes(kSecRandomDefault, bytes.count, base) != errSecSuccess {
            throw domException("OperationError", "getRandomValues: no random bytes")
        }
        return array
    }

    public subscript(jsKey key: String) -> Any? {
        get { key == "subtle" ? subtle : nil }
        set {}
    }
    public var jsKeys: [String] { [] }
    public var jsClassName: String? { "Crypto" }
}

/// `KeyAlgorithm`: the parameters a key was made with, a plain object to script.
public final class JSKeyAlgorithm: JSDynamic {
    nonisolated deinit {}
    private let fields: JSObject

    init(_ fields: [(String, Any?)]) { self.fields = JSObject(fields) }

    public var name: String { fields["name"] as? String ?? "" }

    public subscript(jsKey key: String) -> Any? {
        get { fields[key] }
        set { fields[key] = newValue }
    }
    public var jsKeys: [String] { fields.keys }
    public var jsClassName: String? { nil }
}

/// `CryptoKey`: a secret, public or private key, which script holds without reading its bytes.
public final class JSCryptoKey: JSDynamic {
    nonisolated deinit {}
    enum Material {
        case secret(SymmetricKey)
        case rsa(SecKey)
    }

    public let type: String
    public let extractable: Bool
    public let algorithm: JSKeyAlgorithm
    private let usageList: [String]
    let material: Material
    /// The canonical name of the hash the key was made for (`SHA-256`).
    let hash: String

    init(type: String, extractable: Bool, algorithm: JSKeyAlgorithm, usages: [String], material: Material, hash: String) {
        self.type = type
        self.extractable = extractable
        self.algorithm = algorithm
        usageList = usages
        self.material = material
        self.hash = hash
    }

    public var usages: JSArray<String> { JSArray(usageList) }

    func allows(_ usage: String) -> Bool { usageList.contains(usage) }

    public subscript(jsKey key: String) -> Any? {
        get {
            switch key {
            case "type": return type
            case "extractable": return extractable
            case "algorithm": return algorithm
            case "usages": return usages
            default: return nil
            }
        }
        set {}
    }
    public var jsKeys: [String] { [] }
    public var jsClassName: String? { "CryptoKey" }
}

/// `CryptoKeyPair`: what generating an asymmetric key gives, a plain object to script.
public final class JSCryptoKeyPair: JSDynamic {
    nonisolated deinit {}
    public var publicKey: JSCryptoKey
    public var privateKey: JSCryptoKey

    init(publicKey: JSCryptoKey, privateKey: JSCryptoKey) {
        self.publicKey = publicKey
        self.privateKey = privateKey
    }

    public subscript(jsKey key: String) -> Any? {
        get {
            switch key {
            case "publicKey": return publicKey
            case "privateKey": return privateKey
            default: return nil
            }
        }
        set {
            switch key {
            case "publicKey": if let key = newValue as? JSCryptoKey { publicKey = key }
            case "privateKey": if let key = newValue as? JSCryptoKey { privateKey = key }
            default: break
            }
        }
    }
    public var jsKeys: [String] { ["publicKey", "privateKey"] }
    public var jsClassName: String? { nil }
}

/// `SubtleCrypto`: SHA digests, HMAC and RSA-OAEP, each settling a promise.
public final class JSSubtleCrypto: JSDynamic, @unchecked Sendable {
    nonisolated deinit {}
    public func digest(_ algorithm: Any?, _ data: Any?) -> JSPromise<JSArrayBuffer> {
        settle {
            let hash = try normalizedName(algorithm, among: hashNames)
            let input = try bufferData(data, "digest", 2)
            return try cryptoJob({ try digestOf(input, hash) }, { JSArrayBuffer(data: $0) })
        }
    }

    /// An HMAC key.
    public func generateKey(_ algorithm: Any?, _ extractable: Bool, _ keyUsages: JSArray<String>) -> JSPromise<JSCryptoKey> {
        settle {
            let name = try normalizedName(algorithm, among: ["HMAC"])
            let hash = try hashOf(algorithm)
            let usages = try normalizedUsages(keyUsages, allowed: ["sign", "verify"], name: name)
            guard !usages.isEmpty else { throw domException("SyntaxError", "Usages cannot be empty when creating a key.") }
            let length = jsFlat(jsField(algorithm, "length")).map { Int(jsToNumber($0)) } ?? blockBits(hash)
            guard length > 0 else { throw domException("OperationError", "Invalid key length") }
            let key = SymmetricKey(size: SymmetricKeySize(bitCount: length))
            let described = JSKeyAlgorithm([("name", name), ("length", Double(length)), ("hash", JSObject([("name", hash)]))])
            return JSPromise.resolve(JSCryptoKey(type: "secret", extractable: extractable, algorithm: described, usages: usages, material: .secret(key), hash: hash))
        }
    }

    /// An RSA-OAEP key pair.
    public func generateKey(_ algorithm: Any?, _ extractable: Bool, _ keyUsages: JSArray<String>) -> JSPromise<JSCryptoKeyPair> {
        settle {
            let name = try normalizedName(algorithm, among: ["RSA-OAEP"])
            let hash = try hashOf(algorithm)
            let usages = try normalizedUsages(keyUsages, allowed: ["encrypt", "decrypt", "wrapKey", "unwrapKey"], name: name)
            let modulus = Int(jsToNumber(jsField(algorithm, "modulusLength")))
            guard let exponent = jsFlat(jsField(algorithm, "publicExponent")) as? JSUint8Array else {
                throw JSException(JSTypeError("The \"publicExponent\" member must be a Uint8Array"))
            }
            // Security makes RSA keys with the exponent 65537 only.
            guard Array(exponent.jsBytes.drop(while: { $0 == 0 })) == [1, 0, 1] else { throw domException("OperationError", "Unsupported public exponent") }
            guard modulus >= 256, modulus % 8 == 0 else { throw domException("OperationError", "Invalid key size") }
            let privateUsages = usages.filter { $0 == "decrypt" || $0 == "unwrapKey" }
            guard !privateUsages.isEmpty else { throw domException("SyntaxError", "Usages cannot be empty when creating a key.") }
            let publicUsages = usages.filter { $0 == "encrypt" || $0 == "wrapKey" }
            let publicExponent = JSUint8Array([1, 0, 1] as [Double])
            let described = { JSKeyAlgorithm([("name", name), ("modulusLength", Double(modulus)), ("publicExponent", publicExponent), ("hash", JSObject([("name", hash)]))]) }
            return try cryptoJob({ () throws -> (SecKey, SecKey) in
                let attributes: [CFString: Any] = [kSecAttrKeyType: kSecAttrKeyTypeRSA, kSecAttrKeySizeInBits: modulus]
                var error: Unmanaged<CFError>?
                guard let privateKey = SecKeyCreateRandomKey(attributes as CFDictionary, &error), let publicKey = SecKeyCopyPublicKey(privateKey) else {
                    throw CryptoFailure(message: "RSA key generation failed")
                }
                return (publicKey, privateKey)
            }, { keys in
                JSCryptoKeyPair(
                    publicKey: JSCryptoKey(type: "public", extractable: true, algorithm: described(), usages: publicUsages, material: .rsa(keys.0), hash: hash),
                    privateKey: JSCryptoKey(type: "private", extractable: extractable, algorithm: described(), usages: privateUsages, material: .rsa(keys.1), hash: hash))
            })
        }
    }

    public func sign(_ algorithm: Any?, _ key: JSCryptoKey, _ data: Any?) -> JSPromise<JSArrayBuffer> {
        settle {
            let input = try bufferData(data, "sign", 3)
            guard case .secret(let secret) = key.material, try normalizedName(algorithm, among: ["HMAC"]) == key.algorithm.name, key.allows("sign") else {
                throw domException("InvalidAccessError", "Unable to use this key to sign")
            }
            return JSPromise.resolve(JSArrayBuffer(data: hmac(input, secret, key.hash)))
        }
    }

    public func verify(_ algorithm: Any?, _ key: JSCryptoKey, _ signature: Any?, _ data: Any?) -> JSPromise<Bool> {
        settle {
            let mac = try bufferData(signature, "verify", 3)
            let input = try bufferData(data, "verify", 4)
            guard case .secret(let secret) = key.material, try normalizedName(algorithm, among: ["HMAC"]) == key.algorithm.name, key.allows("verify") else {
                throw domException("InvalidAccessError", "Unable to use this key to verify")
            }
            let expected = hmac(input, secret, key.hash)
            // In constant time, which tells nothing of where a forged signature differs.
            return JSPromise.resolve(expected.count == mac.count && zip(expected, mac).reduce(UInt8(0)) { $0 | ($1.0 ^ $1.1) } == 0)
        }
    }

    public func encrypt(_ algorithm: Any?, _ key: JSCryptoKey, _ data: Any?) -> JSPromise<JSArrayBuffer> {
        rsa(algorithm, key, data, operation: "encrypt", keyType: "public", SecKeyCreateEncryptedData)
    }

    public func decrypt(_ algorithm: Any?, _ key: JSCryptoKey, _ data: Any?) -> JSPromise<JSArrayBuffer> {
        rsa(algorithm, key, data, operation: "decrypt", keyType: "private", SecKeyCreateDecryptedData)
    }

    private func rsa(_ algorithm: Any?, _ key: JSCryptoKey, _ data: Any?, operation: String, keyType: String,
                     _ transform: @escaping (SecKey, SecKeyAlgorithm, CFData, UnsafeMutablePointer<Unmanaged<CFError>?>?) -> CFData?) -> JSPromise<JSArrayBuffer> {
        settle {
            let input = try bufferData(data, operation, 3)
            guard case .rsa(let secKey) = key.material, try normalizedName(algorithm, among: ["RSA-OAEP"]) == key.algorithm.name, key.type == keyType, key.allows(operation) else {
                throw domException("InvalidAccessError", "The requested operation is not valid for the provided key")
            }
            if let label = jsFlat(jsField(algorithm, "label")), try !bufferData(label, operation, 1).isEmpty {
                throw domException("NotSupportedError", "RSA-OAEP labels are not supported")
            }
            let oaep: SecKeyAlgorithm
            switch key.hash {
            case "SHA-1": oaep = .rsaEncryptionOAEPSHA1
            case "SHA-384": oaep = .rsaEncryptionOAEPSHA384
            case "SHA-512": oaep = .rsaEncryptionOAEPSHA512
            default: oaep = .rsaEncryptionOAEPSHA256
            }
            return try cryptoJob({ () throws -> Data in
                guard let out = transform(secKey, oaep, input as CFData, nil) else {
                    throw CryptoFailure(message: "The operation failed for an operation-specific reason")
                }
                return out as Data
            }, { JSArrayBuffer(data: $0) })
        }
    }

    public subscript(jsKey key: String) -> Any? {
        get { nil }
        set {}
    }
    public var jsKeys: [String] { [] }
    public var jsClassName: String? { "SubtleCrypto" }
}

private let hashNames = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"]
private let usageOrder = ["encrypt", "decrypt", "sign", "verify", "deriveKey", "deriveBits", "wrapKey", "unwrapKey"]

/// What a promise-returning method throws while reading its arguments rejects the promise it returns.
private func settle<T>(_ body: () throws -> JSPromise<T>) -> JSPromise<T> {
    do { return try body() } catch { return JSPromise.reject(jsCaught(error)) }
}

/// A crypto operation's failure off the main thread, where no script value can be made: an OperationError on it.
private struct CryptoFailure: Error {
    let message: String
}

/**
 * Runs a slow operation (RSA) on a background queue while the main run loop runs, then `made` on the main
 * thread with its result; both in place otherwise: a command-line program's event loop waits on timers alone.
 * `work` reads only the native values (keys, bytes) it captured and makes no script value.
 */
private func cryptoJob<Native, T>(_ work: @escaping () throws -> Native, _ made: @escaping (Native) -> T) throws -> JSPromise<T> {
    guard Thread.isMainThread, RunLoop.current.currentMode != nil else {
        do { return JSPromise.resolve(made(try work())) } catch let failure as CryptoFailure { throw domException("OperationError", failure.message) }
    }
    let (promise, resolvers) = JSPromise<T>.pending()
    let job = JSCarried(work), made = JSCarried(made)
    DispatchQueue.global(qos: .userInitiated).async {
        let outcome = JSCarried(Result { try job.value() })
        DispatchQueue.main.async {
            switch outcome.value {
            case .success(let value): resolvers.resolve(made.value(value))
            case .failure(let failure as CryptoFailure): resolvers.reject(JSDOMException(failure.message, name: "OperationError"))
            case .failure(let error): resolvers.reject(jsCaught(error))
            }
            Microtasks.taskRan()
            Microtasks.checkpoint()
        }
    }
    return promise
}

/// An algorithm identifier (a name, or an object with one) as the canonical name it matches, case-insensitively.
private func normalizedName(_ algorithm: Any?, among names: [String]) throws -> String {
    let given = jsFlat(algorithm) as? String ?? jsFlat(jsField(algorithm, "name")).map { jsToString($0) }
    guard let given else { throw JSException(JSTypeError("Algorithm: name: Missing or not a string")) }
    guard let name = names.first(where: { $0.caseInsensitiveCompare(given) == .orderedSame }) else {
        throw domException("NotSupportedError", "Unrecognized algorithm name")
    }
    return name
}

private func hashOf(_ algorithm: Any?) throws -> String {
    guard let hash = jsFlat(jsField(algorithm, "hash")) else { throw JSException(JSTypeError("Algorithm: hash: Missing")) }
    return try normalizedName(hash, among: hashNames)
}

private func normalizedUsages(_ usages: JSArray<String>, allowed: [String], name: String) throws -> [String] {
    for usage in usages where !allowed.contains(usage) {
        throw domException("SyntaxError", "Unsupported key usage for \(name) key")
    }
    return usageOrder.filter { usages.contains($0) }
}

private func bufferData(_ value: Any?, _ method: String, _ position: Int) throws -> Data {
    guard let source = jsFlat(value) as? JSBufferSource else {
        let ordinal = ["1st", "2nd", "3rd", "4th"][min(position, 4) - 1]
        throw JSException(JSTypeError("Failed to execute '\(method)' on 'SubtleCrypto': \(ordinal) argument is not instance of ArrayBuffer, Buffer, TypedArray, or DataView."))
    }
    return Data(source.jsBytes)
}

private func digestOf(_ data: Data, _ hash: String) throws -> Data {
    switch hash {
    case "SHA-1": return Data(Insecure.SHA1.hash(data: data))
    case "SHA-256": return Data(SHA256.hash(data: data))
    case "SHA-384": return Data(SHA384.hash(data: data))
    case "SHA-512": return Data(SHA512.hash(data: data))
    default: throw domException("NotSupportedError", "Unrecognized algorithm name")
    }
}

/// The hash's block size in bits: an HMAC key's length when none is given.
private func blockBits(_ hash: String) -> Int { hash == "SHA-384" || hash == "SHA-512" ? 1024 : 512 }

private func hmac(_ data: Data, _ key: SymmetricKey, _ hash: String) -> Data {
    switch hash {
    case "SHA-1": return Data(HMAC<Insecure.SHA1>.authenticationCode(for: data, using: key))
    case "SHA-384": return Data(HMAC<SHA384>.authenticationCode(for: data, using: key))
    case "SHA-512": return Data(HMAC<SHA512>.authenticationCode(for: data, using: key))
    default: return Data(HMAC<SHA256>.authenticationCode(for: data, using: key))
    }
}

/// `URLSearchParams`: an ordered list of `(name, value)` query pairs, optionally backed by a `JSURL`.
public final class JSURLSearchParams: JSDynamic, Sequence {
    nonisolated deinit {}
    var pairs: [(String, String)] = []
    weak var owner: JSURL?
    var syncing = false

    public init(_ input: Any? = nil) {
        if let existing = jsFlat(input) as? JSURLSearchParams {
            pairs = existing.pairs
        } else if let s = jsFlat(input) as? String {
            parse(s.hasPrefix("?") ? String(s.dropFirst()) : s)
        } else if let arr = jsFlat(input) as? JSArrayProtocol {
            for item in arr.jsAnyElements {
                if let pair = jsFlat(item) as? JSArrayProtocol {
                    let elems = pair.jsAnyElements
                    if elems.count >= 2 { pairs.append((jsToString(elems[0]), jsToString(elems[1]))) }
                }
            }
        } else if let dyn = jsFlat(input) as? JSDynamic {
            for k in dyn.jsKeys {
                pairs.append((k, jsToString(dyn[jsKey: k])))
            }
        }
    }

    func parse(_ query: String) {
        pairs.removeAll()
        guard !query.isEmpty else { return }
        for part in query.split(separator: "&", omittingEmptySubsequences: false) {
            let s = String(part)
            guard !s.isEmpty else { continue }
            if let eq = s.firstIndex(of: "=") {
                let k = Self.decode(String(s[..<eq]))
                let v = Self.decode(String(s[s.index(after: eq)...]))
                pairs.append((k, v))
            } else {
                pairs.append((Self.decode(s), ""))
            }
        }
    }

    private static func decode(_ s: String) -> String {
        let plus = s.replacingOccurrences(of: "+", with: " ")
        return plus.removingPercentEncoding ?? plus
    }

    private static let allowed: CharacterSet = {
        var set = CharacterSet.alphanumerics
        set.insert(charactersIn: "*-._")
        return set
    }()

    private static func encode(_ s: String) -> String {
        var out = ""
        for part in s.split(separator: " ", omittingEmptySubsequences: false) {
            if !out.isEmpty || s.hasPrefix(" ") && out.isEmpty && part.isEmpty { }
            out += (String(part).addingPercentEncoding(withAllowedCharacters: allowed) ?? String(part)) + "+"
        }
        if out.hasSuffix("+") { out.removeLast() }
        return out
    }

    private func notifyOwner() {
        guard !syncing, let owner else { return }
        owner.syncFromSearchParams()
    }

    public var size: Double { Double(pairs.count) }

    public func get(_ name: String) -> String? {
        pairs.first(where: { $0.0 == name })?.1
    }

    public func getAll(_ name: String) -> JSArray<String> {
        JSArray(pairs.filter { $0.0 == name }.map(\.1))
    }

    public func has(_ name: String, _ value: String? = nil) -> Bool {
        if let value { return pairs.contains(where: { $0.0 == name && $0.1 == value }) }
        return pairs.contains(where: { $0.0 == name })
    }

    public func set(_ name: String, _ value: String) {
        var replaced = false
        pairs = pairs.compactMap { pair in
            guard pair.0 == name else { return pair }
            if !replaced { replaced = true; return (name, value) }
            return nil
        }
        if !replaced { pairs.append((name, value)) }
        notifyOwner()
    }

    public func append(_ name: String, _ value: String) {
        pairs.append((name, value))
        notifyOwner()
    }

    public func delete(_ name: String, _ value: String? = nil) {
        if let value { pairs.removeAll { $0.0 == name && $0.1 == value } }
        else { pairs.removeAll { $0.0 == name } }
        notifyOwner()
    }

    public func sort() {
        pairs.sort { $0.0 < $1.0 }
        notifyOwner()
    }

    public func forEach(_ callback: (String, String, JSURLSearchParams) throws -> Void, _ thisArg: Any? = nil) rethrows {
        for (k, v) in pairs { try callback(v, k, self) }
    }

    public func forEach(_ callback: (String, String) throws -> Void, _ thisArg: Any? = nil) rethrows {
        for (k, v) in pairs { try callback(v, k) }
    }

    public func forEach(_ callback: (String) throws -> Void, _ thisArg: Any? = nil) rethrows {
        for (_, v) in pairs { try callback(v) }
    }

    public func keys() -> JSIterator<String> {
        var i = 0; let list = pairs.map(\.0)
        return JSIterator { defer { i += 1 }; return i < list.count ? list[i] : nil }
    }
    public func values() -> JSIterator<String> {
        var i = 0; let list = pairs.map(\.1)
        return JSIterator { defer { i += 1 }; return i < list.count ? list[i] : nil }
    }
    public func entries() -> JSIterator<JSArray<String>> {
        var i = 0; let list = pairs.map { JSArray([$0.0, $0.1]) }
        return JSIterator { defer { i += 1 }; return i < list.count ? list[i] : nil }
    }
    public func makeIterator() -> IndexingIterator<[JSArray<String>]> { pairs.map { JSArray([$0.0, $0.1]) }.makeIterator() }

    public func toString() -> String {
        pairs.map { "\(Self.encode($0.0))=\(Self.encode($0.1))" }.joined(separator: "&")
    }

    public subscript(jsKey key: String) -> Any? {
        get {
            switch key {
            case "size": return size
            default: return nil
            }
        }
        set {}
    }
    public var jsKeys: [String] { [] }
    public var jsClassName: String? { "URLSearchParams" }
}

/// `URL`: a parsed WHATWG URL backed by Foundation's `URLComponents`.
public final class JSURL: JSDynamic {
    nonisolated deinit {}
    private var components: URLComponents
    public let searchParams: JSURLSearchParams

    public init(_ url: Any?, _ base: Any? = nil) throws {
        let raw = (jsFlat(url) as? JSURL)?.href ?? jsToString(url)
        let resolved: Foundation.URL?
        if let base = jsFlat(base) {
            let baseStr = (base as? JSURL)?.href ?? jsToString(base)
            guard let baseURL = Foundation.URL(string: baseStr), baseURL.scheme != nil else {
                throw JSException(JSTypeError("Invalid base URL: \(baseStr)"))
            }
            resolved = Foundation.URL(string: raw, relativeTo: baseURL)?.absoluteURL
        } else {
            resolved = Foundation.URL(string: raw)
        }
        guard let finalURL = resolved, finalURL.scheme != nil, let comps = URLComponents(url: finalURL, resolvingAgainstBaseURL: true) else {
            throw JSException(JSTypeError("Invalid URL: \(raw)"))
        }
        self.components = comps
        self.searchParams = JSURLSearchParams(comps.percentEncodedQuery ?? "")
        self.searchParams.owner = self
    }

    func syncFromSearchParams() {
        let q = searchParams.toString()
        components.percentEncodedQuery = q.isEmpty ? nil : q
    }

    public var href: String {
        get { components.string ?? "" }
        set {
            if let u = Foundation.URL(string: newValue), u.scheme != nil, let c = URLComponents(url: u, resolvingAgainstBaseURL: true) {
                components = c
                searchParams.syncing = true
                searchParams.parse(c.percentEncodedQuery ?? "")
                searchParams.syncing = false
            }
        }
    }

    public var `protocol`: String {
        get { components.scheme.map { "\($0):" } ?? "" }
        set {
            let s = newValue.hasSuffix(":") ? String(newValue.dropLast()) : newValue
            if !s.isEmpty { components.scheme = s.lowercased() }
        }
    }

    public var username: String {
        get { components.percentEncodedUser ?? "" }
        set { components.percentEncodedUser = newValue.isEmpty ? nil : newValue }
    }

    public var password: String {
        get { components.percentEncodedPassword ?? "" }
        set { components.percentEncodedPassword = newValue.isEmpty ? nil : newValue }
    }

    public var hostname: String {
        get { components.host ?? "" }
        set { components.host = newValue }
    }

    public var port: String {
        get { components.port.map(String.init) ?? "" }
        set { components.port = Int(newValue) }
    }

    public var host: String {
        get {
            let h = hostname
            let p = port
            return p.isEmpty ? h : "\(h):\(p)"
        }
        set {
            if let colon = newValue.lastIndex(of: ":"), let p = Int(newValue[newValue.index(after: colon)...]) {
                components.host = String(newValue[..<colon])
                components.port = p
            } else {
                components.host = newValue
                components.port = nil
            }
        }
    }

    public var origin: String {
        let p = self.protocol
        let h = host
        guard !p.isEmpty, !h.isEmpty else { return "null" }
        return "\(p)//\(h)"
    }

    public var pathname: String {
        get {
            let p = components.percentEncodedPath
            return p.isEmpty ? (components.host != nil ? "/" : "") : p
        }
        set {
            components.percentEncodedPath = newValue.hasPrefix("/") || newValue.isEmpty ? newValue : "/\(newValue)"
        }
    }

    public var search: String {
        get {
            guard let q = components.percentEncodedQuery, !q.isEmpty else { return "" }
            return "?\(q)"
        }
        set {
            let q = newValue.hasPrefix("?") ? String(newValue.dropFirst()) : newValue
            components.percentEncodedQuery = q.isEmpty ? nil : q
            searchParams.syncing = true
            searchParams.parse(q)
            searchParams.syncing = false
        }
    }

    public var hash: String {
        get {
            guard let f = components.percentEncodedFragment, !f.isEmpty else { return "" }
            return "#\(f)"
        }
        set {
            let f = newValue.hasPrefix("#") ? String(newValue.dropFirst()) : newValue
            components.percentEncodedFragment = f.isEmpty ? nil : f
        }
    }

    public func toString() -> String { href }
    public func toJSON() -> String { href }

    public subscript(jsKey key: String) -> Any? {
        get {
            switch key {
            case "href": return href
            case "origin": return origin
            case "protocol": return self.protocol
            case "username": return username
            case "password": return password
            case "host": return host
            case "hostname": return hostname
            case "port": return port
            case "pathname": return pathname
            case "search": return search
            case "searchParams": return searchParams
            case "hash": return hash
            default: return nil
            }
        }
        set {
            let s = jsToString(newValue)
            switch key {
            case "href": href = s
            case "protocol": self.protocol = s
            case "username": username = s
            case "password": password = s
            case "host": host = s
            case "hostname": hostname = s
            case "port": port = s
            case "pathname": pathname = s
            case "search": search = s
            case "hash": hash = s
            default: break
            }
        }
    }
    public var jsKeys: [String] { ["href", "origin", "protocol", "username", "password", "host", "hostname", "port", "pathname", "search", "searchParams", "hash"] }
    public var jsClassName: String? { "URL" }
}


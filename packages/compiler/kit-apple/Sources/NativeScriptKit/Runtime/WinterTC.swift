import Foundation
import CryptoKit
import Security

// The web globals NativeScript's runtime gives every app (WinterTC's minimum common API):
// atob and btoa, TextEncoder and TextDecoder, and crypto with its SubtleCrypto.

/// `DOMException`: an error the web's APIs throw, told apart by its name.
public final class JSDOMException: JSError {
    public init(_ message: String, name: String) {
        super.init(message)
        self.name = name
    }
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
    public func digest(_ algorithm: Any?, _ data: Any?) -> JSPromise<JSArrayBuffer> {
        settle {
            let hash = try normalizedName(algorithm, among: hashNames)
            let input = try bufferData(data, "digest", 2)
            return try cryptoJob { JSArrayBuffer(data: try digestOf(input, hash)) }
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
            return try cryptoJob { () throws -> JSCryptoKeyPair in
                let attributes: [CFString: Any] = [kSecAttrKeyType: kSecAttrKeyTypeRSA, kSecAttrKeySizeInBits: modulus]
                var error: Unmanaged<CFError>?
                guard let privateKey = SecKeyCreateRandomKey(attributes as CFDictionary, &error), let publicKey = SecKeyCopyPublicKey(privateKey) else {
                    throw domException("OperationError", "RSA key generation failed")
                }
                return JSCryptoKeyPair(
                    publicKey: JSCryptoKey(type: "public", extractable: true, algorithm: described(), usages: publicUsages, material: .rsa(publicKey), hash: hash),
                    privateKey: JSCryptoKey(type: "private", extractable: extractable, algorithm: described(), usages: privateUsages, material: .rsa(privateKey), hash: hash))
            }
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
            return try cryptoJob {
                guard let out = transform(secKey, oaep, input as CFData, nil) else {
                    throw domException("OperationError", "The operation failed for an operation-specific reason")
                }
                return JSArrayBuffer(data: out as Data)
            }
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

/// Runs a slow operation (RSA) on a background queue while the main run loop runs to deliver its
/// result, and in place otherwise: a command-line program's event loop waits on timers alone.
private func cryptoJob<T>(_ work: @escaping () throws -> T) throws -> JSPromise<T> {
    guard Thread.isMainThread, RunLoop.current.currentMode != nil else { return JSPromise.resolve(try work()) }
    let (promise, resolvers) = JSPromise<T>.pending()
    DispatchQueue.global(qos: .userInitiated).async {
        let result = Result { try work() }
        DispatchQueue.main.async {
            switch result {
            case .success(let value): resolvers.resolve(value)
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

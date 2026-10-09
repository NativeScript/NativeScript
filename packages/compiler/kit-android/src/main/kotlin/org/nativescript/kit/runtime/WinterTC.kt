package org.nativescript.kit

import java.nio.ByteBuffer
import java.nio.charset.CharacterCodingException
import java.nio.charset.CodingErrorAction
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.security.MessageDigest
import java.security.SecureRandom
import java.security.spec.MGF1ParameterSpec
import java.security.spec.RSAKeyGenParameterSpec
import javax.crypto.Cipher
import javax.crypto.Mac
import javax.crypto.spec.OAEPParameterSpec
import javax.crypto.spec.PSource
import javax.crypto.spec.SecretKeySpec

// The web globals NativeScript's runtime gives every app (WinterTC's minimum common API):
// atob and btoa, TextEncoder and TextDecoder, and crypto with its SubtleCrypto.

/** `DOMException`: an error the web's APIs throw, told apart by its name. `new DOMException(message, name)` constructs one. */
class JSDOMException(message: String, name: String) : JSError(message) {
    init { this.name = name }

    constructor() : this("", "Error")
    constructor(message: Any?) : this(if (jsIsNullish(message)) "" else jsToString(message), "Error")
    constructor(message: Any?, name: Any?) : this(if (jsIsNullish(message)) "" else jsToString(message), if (jsIsNullish(name)) "Error" else jsToString(name))
}

private fun domException(name: String, message: String) = JSException(JSDOMException(message, name))

private val random = SecureRandom()

// Base64

private const val BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

/** `btoa(data)`: each character a byte, so one above U+00FF has no encoding. */
fun jsBtoa(data: String): String {
    val bytes = ByteArray(data.length)
    for ((k, c) in data.withIndex()) {
        if (c.code > 0xFF) throw domException("InvalidCharacterError", "Invalid character")
        bytes[k] = c.code.toByte()
    }
    return java.util.Base64.getEncoder().encodeToString(bytes)
}

/** `atob(data)`: forgiving-base64 decode (HTML §8.3), each byte one character of the result. */
fun jsAtob(data: String): String {
    val invalid = { domException("InvalidCharacterError", "The string to be decoded is not correctly encoded.") }
    val units = StringBuilder(data.filter { it !in "\t\n\u000C\r " })
    if (units.length % 4 == 0) {
        if (units.endsWith("=")) units.setLength(units.length - 1)
        if (units.endsWith("=")) units.setLength(units.length - 1)
    }
    if (units.length % 4 == 1) throw invalid()
    val out = StringBuilder(units.length * 3 / 4)
    var buffer = 0
    var bits = 0
    for (c in units) {
        val value = BASE64.indexOf(c)
        if (value < 0) throw invalid()
        buffer = (buffer shl 6) or value
        bits += 6
        if (bits >= 8) {
            bits -= 8
            out.append(((buffer shr bits) and 0xFF).toChar())
        }
    }
    return out.toString()
}

// Text encoding

private fun bytesOf(source: JSBufferSource): ByteArray {
    val view = source.jsBytes.duplicate()
    val out = ByteArray(view.remaining())
    view.get(out)
    return out
}

private fun uint8ArrayOf(bytes: ByteArray) = JSUint8Array(JSArrayBuffer.from(ByteBuffer.wrap(bytes)))

/** `TextEncoder`: strings to UTF-8. */
class JSTextEncoder : JSDynamic {
    val encoding: String get() = "utf-8"

    fun encode(input: String? = null): JSUint8Array = uint8ArrayOf((input ?: "").toByteArray(Charsets.UTF_8))

    override fun jsGet(key: String): Any? = when (key) {
        "encoding" -> encoding
        "encode" -> JSMethod { _, a -> encode(a.getOrNull(0)?.let { if (jsIsNullish(it)) null else jsToString(it) }) }
        else -> null
    }
    override fun jsSet(key: String, value: Any?) {}
    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = "TextEncoder"
}

/** `TextDecoder`: UTF-8 to strings, the only encoding NativeScript's runtime decodes. */
class JSTextDecoder(@Suppress("UNUSED_PARAMETER") label: String? = null, options: Any? = null) : JSDynamic {
    val fatal: Boolean = jsTruthy(jsField(options, "fatal"))
    val ignoreBOM: Boolean = jsTruthy(jsField(options, "ignoreBOM"))
    val encoding: String get() = "utf-8"

    fun decode(input: Any? = null): String {
        val value = jsBox(input)
        if (value == null || value === JSNull) return ""
        val source = value as? JSBufferSource ?: throw JSException(JSTypeError("The \"input\" argument must be an instance of ArrayBuffer or ArrayBufferView."))
        var bytes = bytesOf(source)
        if (!ignoreBOM && bytes.size >= 3 && bytes[0] == 0xEF.toByte() && bytes[1] == 0xBB.toByte() && bytes[2] == 0xBF.toByte()) bytes = bytes.copyOfRange(3, bytes.size)
        val action = if (fatal) CodingErrorAction.REPORT else CodingErrorAction.REPLACE
        val decoder = Charsets.UTF_8.newDecoder().onMalformedInput(action).onUnmappableCharacter(action)
        return try {
            decoder.decode(ByteBuffer.wrap(bytes)).toString()
        } catch (_: CharacterCodingException) {
            throw JSException(JSTypeError("The encoded data was not valid for encoding utf-8"))
        }
    }

    override fun jsGet(key: String): Any? = when (key) {
        "encoding" -> encoding
        "fatal" -> fatal
        "ignoreBOM" -> ignoreBOM
        "decode" -> JSMethod { _, a -> decode(a.getOrNull(0)) }
        else -> null
    }
    override fun jsSet(key: String, value: Any?) {}
    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = "TextDecoder"
}

// Crypto

/** `crypto`, the global. */
val crypto = JSCrypto()

/** `Crypto`: random values and the subtle API. */
class JSCrypto : JSDynamic {
    val subtle = JSSubtleCrypto()

    fun randomUUID(): String = java.util.UUID.randomUUID().toString()

    /** Fills an integer typed array with random bytes and returns it; at most 65536 bytes a call. */
    fun <T> getRandomValues(array: T): T {
        val view = jsBox(array) as? JSArrayBufferView ?: throw JSException(JSTypeError("The \"typedArray\" argument must be an instance of ArrayBufferView."))
        val kind = (view as? JSTypedArray<*, *>)?.kind
        if (kind == null || kind == JSTypedArrayKind.FLOAT32 || kind == JSTypedArrayKind.FLOAT64) throw domException("TypeMismatchError", "The data argument must be an integer-type TypedArray")
        val bytes = view.jsBytes.duplicate()
        val count = bytes.remaining()
        if (count > 65536) throw domException("QuotaExceededError", "The ArrayBufferView's byte length ($count) exceeds the number of bytes of entropy available via this API (65536)")
        val fill = ByteArray(count)
        random.nextBytes(fill)
        bytes.put(fill)
        return array
    }

    override fun jsGet(key: String): Any? = when (key) {
        "subtle" -> subtle
        "randomUUID" -> JSMethod { _, _ -> randomUUID() }
        "getRandomValues" -> JSMethod { _, a -> getRandomValues(a.getOrNull(0)) }
        else -> null
    }
    override fun jsSet(key: String, value: Any?) {}
    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = "Crypto"
}

/** `KeyAlgorithm`: the parameters a key was made with, a plain object to script. */
class JSKeyAlgorithm internal constructor(vararg fields: Pair<String, Any?>) : JSDynamic {
    private val fields = JSObject(*fields)

    val name: String get() = fields["name"] as? String ?: ""

    override fun jsGet(key: String): Any? = fields[key]
    override fun jsSet(key: String, value: Any?) { fields[key] = value }
    override val jsKeys: List<String> get() = fields.keys
    override val jsClassName: String? get() = null
}

/** `CryptoKey`: a secret, public or private key, which script holds without reading its bytes. */
class JSCryptoKey internal constructor(
    val type: String,
    val extractable: Boolean,
    val algorithm: JSKeyAlgorithm,
    private val usageList: List<String>,
    internal val material: Any,
    /** The canonical name of the hash the key was made for (`SHA-256`). */
    internal val hash: String,
) : JSDynamic {
    val usages: JSArray<String> get() = JSArray(ArrayList(usageList))

    internal fun allows(usage: String) = usage in usageList

    override fun jsGet(key: String): Any? = when (key) {
        "type" -> type
        "extractable" -> extractable
        "algorithm" -> algorithm
        "usages" -> usages
        else -> null
    }
    override fun jsSet(key: String, value: Any?) {}
    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = "CryptoKey"
}

/** `CryptoKeyPair`: what generating an asymmetric key gives, a plain object to script. */
class JSCryptoKeyPair internal constructor(var publicKey: JSCryptoKey, var privateKey: JSCryptoKey) : JSDynamic {
    override fun jsGet(key: String): Any? = when (key) {
        "publicKey" -> publicKey
        "privateKey" -> privateKey
        else -> null
    }
    override fun jsSet(key: String, value: Any?) {
        when (key) {
            "publicKey" -> (value as? JSCryptoKey)?.let { publicKey = it }
            "privateKey" -> (value as? JSCryptoKey)?.let { privateKey = it }
        }
    }
    override val jsKeys: List<String> get() = listOf("publicKey", "privateKey")
    override val jsClassName: String? get() = null
}

/** `SubtleCrypto`: SHA digests, HMAC and RSA-OAEP, each settling a promise. */
class JSSubtleCrypto : JSDynamic {
    fun digest(algorithm: Any?, data: Any?): JSPromise<JSArrayBuffer> = settle {
        val hash = normalizedName(algorithm, HASH_NAMES)
        val input = bufferData(data, "digest", 2)
        JSPromise.resolve(bufferOf(MessageDigest.getInstance(hash).digest(input)))
    }

    /** `generateKey` for HMAC, the overload that gives one key. */
    fun generateKey(algorithm: Any?, extractable: Boolean, keyUsages: JSArray<String>): JSPromise<JSCryptoKey> = settle {
        val name = normalizedName(algorithm, listOf("HMAC"))
        val hash = hashOf(algorithm)
        val usages = normalizedUsages(keyUsages, listOf("sign", "verify"), name)
        if (usages.isEmpty()) throw domException("SyntaxError", "Usages cannot be empty when creating a key.")
        val given = jsBox(jsField(algorithm, "length"))
        val length = if (given == null || given === JSNull) blockBits(hash) else jsToNumber(given).toInt()
        if (length <= 0) throw domException("OperationError", "Invalid key length")
        val secret = ByteArray((length + 7) / 8).also { random.nextBytes(it) }
        val described = JSKeyAlgorithm("name" to name, "length" to length.toDouble(), "hash" to JSObject("name" to hash))
        JSPromise.resolve(JSCryptoKey("secret", extractable, described, usages, secret, hash))
    }

    /** `generateKey` for RSA-OAEP, the overload that gives a key pair. */
    fun generateKeyPair(algorithm: Any?, extractable: Boolean, keyUsages: JSArray<String>): JSPromise<JSCryptoKeyPair> = settle {
        val name = normalizedName(algorithm, listOf("RSA-OAEP"))
        val hash = hashOf(algorithm)
        val usages = normalizedUsages(keyUsages, listOf("encrypt", "decrypt", "wrapKey", "unwrapKey"), name)
        val modulus = jsToNumber(jsField(algorithm, "modulusLength")).toInt()
        val exponent = jsBox(jsField(algorithm, "publicExponent")) as? JSUint8Array ?: throw JSException(JSTypeError("The \"publicExponent\" member must be a Uint8Array"))
        // As on iOS, whose Security makes RSA keys with the exponent 65537 only.
        if (bytesOf(exponent).dropWhile { it == 0.toByte() } != listOf<Byte>(1, 0, 1)) throw domException("OperationError", "Unsupported public exponent")
        if (modulus < 256 || modulus % 8 != 0) throw domException("OperationError", "Invalid key size")
        val privateUsages = usages.filter { it == "decrypt" || it == "unwrapKey" }
        if (privateUsages.isEmpty()) throw domException("SyntaxError", "Usages cannot be empty when creating a key.")
        val publicUsages = usages.filter { it == "encrypt" || it == "wrapKey" }
        val described = { JSKeyAlgorithm("name" to name, "modulusLength" to modulus.toDouble(), "publicExponent" to uint8ArrayOf(byteArrayOf(1, 0, 1)), "hash" to JSObject("name" to hash)) }
        val pair: KeyPair = try {
            KeyPairGenerator.getInstance("RSA").apply { initialize(RSAKeyGenParameterSpec(modulus, RSAKeyGenParameterSpec.F4), random) }.generateKeyPair()
        } catch (e: java.security.GeneralSecurityException) {
            throw domException("OperationError", "RSA key generation failed")
        }
        JSPromise.resolve(JSCryptoKeyPair(
            JSCryptoKey("public", true, described(), publicUsages, pair.public, hash),
            JSCryptoKey("private", extractable, described(), privateUsages, pair.private, hash),
        ))
    }

    fun sign(algorithm: Any?, key: JSCryptoKey, data: Any?): JSPromise<JSArrayBuffer> = settle {
        val input = bufferData(data, "sign", 3)
        val secret = key.material as? ByteArray
        if (secret == null || normalizedName(algorithm, listOf("HMAC")) != key.algorithm.name || !key.allows("sign")) throw domException("InvalidAccessError", "Unable to use this key to sign")
        JSPromise.resolve(bufferOf(hmac(input, secret, key.hash)))
    }

    fun verify(algorithm: Any?, key: JSCryptoKey, signature: Any?, data: Any?): JSPromise<Boolean> = settle {
        val mac = bufferData(signature, "verify", 3)
        val input = bufferData(data, "verify", 4)
        val secret = key.material as? ByteArray
        if (secret == null || normalizedName(algorithm, listOf("HMAC")) != key.algorithm.name || !key.allows("verify")) throw domException("InvalidAccessError", "Unable to use this key to verify")
        // In constant time, which tells nothing of where a forged signature differs.
        JSPromise.resolve(MessageDigest.isEqual(hmac(input, secret, key.hash), mac))
    }

    fun encrypt(algorithm: Any?, key: JSCryptoKey, data: Any?): JSPromise<JSArrayBuffer> = rsa(algorithm, key, data, "encrypt", "public", Cipher.ENCRYPT_MODE)

    fun decrypt(algorithm: Any?, key: JSCryptoKey, data: Any?): JSPromise<JSArrayBuffer> = rsa(algorithm, key, data, "decrypt", "private", Cipher.DECRYPT_MODE)

    private fun rsa(algorithm: Any?, key: JSCryptoKey, data: Any?, operation: String, keyType: String, mode: Int): JSPromise<JSArrayBuffer> = settle {
        val input = bufferData(data, operation, 3)
        val rsaKey = key.material as? java.security.Key
        if (rsaKey == null || normalizedName(algorithm, listOf("RSA-OAEP")) != key.algorithm.name || key.type != keyType || !key.allows(operation)) {
            throw domException("InvalidAccessError", "The requested operation is not valid for the provided key")
        }
        val label = jsBox(jsField(algorithm, "label"))
        if (label != null && label !== JSNull && bufferData(label, operation, 1).isNotEmpty()) throw domException("NotSupportedError", "RSA-OAEP labels are not supported")
        // MGF1 over the key's hash, as WebCrypto has it (the JCA's "OAEPWith<hash>AndMGF1Padding" takes SHA-1 for MGF1).
        val spec = OAEPParameterSpec(key.hash, "MGF1", MGF1ParameterSpec(key.hash), PSource.PSpecified.DEFAULT)
        val out = try {
            Cipher.getInstance("RSA/ECB/OAEPPadding").apply { init(mode, rsaKey, spec) }.doFinal(input)
        } catch (e: java.security.GeneralSecurityException) {
            throw domException("OperationError", "The operation failed for an operation-specific reason")
        }
        JSPromise.resolve(bufferOf(out))
    }

    override fun jsGet(key: String): Any? = null
    override fun jsSet(key: String, value: Any?) {}
    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = "SubtleCrypto"
}

private val HASH_NAMES = listOf("SHA-1", "SHA-256", "SHA-384", "SHA-512")
private val USAGE_ORDER = listOf("encrypt", "decrypt", "sign", "verify", "deriveKey", "deriveBits", "wrapKey", "unwrapKey")

/** What a promise-returning method throws while reading its arguments rejects the promise it returns. */
private fun <T> settle(body: () -> JSPromise<T>): JSPromise<T> = try { body() } catch (e: Throwable) { JSPromise.reject(jsCaught(e)) }

private fun bufferOf(bytes: ByteArray): JSArrayBuffer = JSArrayBuffer.from(ByteBuffer.wrap(bytes))

/** An algorithm identifier (a name, or an object with one) as the canonical name it matches, case-insensitively. */
private fun normalizedName(algorithm: Any?, names: List<String>): String {
    val value = jsBox(algorithm)
    val given = value as? String ?: jsBox(jsField(value, "name"))?.takeIf { it !== JSNull }?.let { jsToString(it) }
        ?: throw JSException(JSTypeError("Algorithm: name: Missing or not a string"))
    return names.firstOrNull { it.equals(given, ignoreCase = true) } ?: throw domException("NotSupportedError", "Unrecognized algorithm name")
}

private fun hashOf(algorithm: Any?): String {
    val hash = jsBox(jsField(algorithm, "hash"))
    if (hash == null || hash === JSNull) throw JSException(JSTypeError("Algorithm: hash: Missing"))
    return normalizedName(hash, HASH_NAMES)
}

private fun normalizedUsages(usages: JSArray<String>, allowed: List<String>, name: String): List<String> {
    for (usage in usages.storage) if (usage !in allowed) throw domException("SyntaxError", "Unsupported key usage for $name key")
    return USAGE_ORDER.filter { it in usages.storage }
}

private fun bufferData(value: Any?, method: String, position: Int): ByteArray {
    val source = jsBox(value) as? JSBufferSource ?: run {
        val ordinal = listOf("1st", "2nd", "3rd", "4th")[minOf(position, 4) - 1]
        throw JSException(JSTypeError("Failed to execute '$method' on 'SubtleCrypto': $ordinal argument is not instance of ArrayBuffer, Buffer, TypedArray, or DataView."))
    }
    return bytesOf(source)
}

/** The hash's block size in bits: an HMAC key's length when none is given. */
private fun blockBits(hash: String) = if (hash == "SHA-384" || hash == "SHA-512") 1024 else 512

private fun hmac(data: ByteArray, key: ByteArray, hash: String): ByteArray {
    val algorithm = "Hmac" + hash.replace("-", "")
    return Mac.getInstance(algorithm).apply { init(SecretKeySpec(key, algorithm)) }.doFinal(data)
}

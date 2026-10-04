package org.nativescript.kit

import java.math.BigInteger

/** A JavaScript BigInt: an integer of any size, a primitive compared by value. */
class JSBigInt(val value: BigInteger) : Comparable<JSBigInt> {
    constructor(v: Long) : this(BigInteger.valueOf(v))

    val isZero: Boolean get() = value.signum() == 0

    /** `Number(bigint)`: the nearest double. */
    fun toDouble(): Double = value.toDouble()

    fun toString(radix: Double): String = value.toString(radix.toInt())
    override fun toString(): String = value.toString()
    override fun equals(other: Any?): Boolean = other is JSBigInt && other.value == value
    override fun hashCode(): Int = value.hashCode()
    override fun compareTo(other: JSBigInt): Int = value.compareTo(other.value)

    operator fun plus(b: JSBigInt) = JSBigInt(value.add(b.value))
    operator fun minus(b: JSBigInt) = JSBigInt(value.subtract(b.value))
    operator fun times(b: JSBigInt) = JSBigInt(value.multiply(b.value))
    operator fun unaryMinus() = JSBigInt(value.negate())
    operator fun inc() = JSBigInt(value.add(BigInteger.ONE))
    operator fun dec() = JSBigInt(value.subtract(BigInteger.ONE))
    infix fun and(b: JSBigInt) = JSBigInt(value.and(b.value))
    infix fun or(b: JSBigInt) = JSBigInt(value.or(b.value))
    infix fun xor(b: JSBigInt) = JSBigInt(value.xor(b.value))
    fun inv() = JSBigInt(value.not())

    companion object {
        /** A literal's digits (`123`, `0xff`, `0o17`, `0b101`). */
        fun literal(text: String): JSBigInt {
            val t = text.replace("_", "")
            if (t.length > 2 && t[0] == '0') {
                when (t[1]) {
                    'x', 'X' -> return JSBigInt(BigInteger(t.substring(2), 16))
                    'o', 'O' -> return JSBigInt(BigInteger(t.substring(2), 8))
                    'b', 'B' -> return JSBigInt(BigInteger(t.substring(2), 2))
                }
            }
            return JSBigInt(BigInteger(t))
        }

        /** `BigInt(value)`. */
        fun convert(value: Any?): JSBigInt = when (val v = jsBox(value)) {
            is JSBigInt -> v
            is Boolean -> JSBigInt(if (v) 1L else 0L)
            is String -> {
                var t = jsTrim(v)
                if (t.isEmpty()) JSBigInt(0L) else {
                    var negative = false
                    if (t[0] == '-' || t[0] == '+') { negative = t[0] == '-'; t = t.substring(1) }
                    var radix = 10
                    if (!negative && t.length > 2 && t[0] == '0' && t[1] in "xXoObB") {
                        radix = if (t[1] in "xX") 16 else if (t[1] in "oO") 8 else 2
                        t = t.substring(2)
                    }
                    if (t.isEmpty() || !t.all { Character.digit(it, radix) >= 0 }) throw JSException(JSSyntaxError("Cannot convert $v to a BigInt"))
                    val parsed = BigInteger(t, radix)
                    JSBigInt(if (negative) parsed.negate() else parsed)
                }
            }
            null -> throw JSException(JSTypeError("Cannot convert undefined to a BigInt"))
            JSNull -> throw JSException(JSTypeError("Cannot convert null to a BigInt"))
            else -> jsNumeric(v)?.let { number(it) } ?: throw JSException(JSSyntaxError("Cannot convert ${jsToString(v)} to a BigInt"))
        }

        /** NumberToBigInt: a RangeError unless the number is an integer. */
        fun number(d: Double): JSBigInt {
            if (d.isNaN() || d.isInfinite() || d != Math.floor(d)) throw JSException(JSRangeError("The number ${jsNumberToString(d)} cannot be converted to a BigInt because it is not an integer"))
            return JSBigInt(java.math.BigDecimal(d).toBigInteger())
        }

        /** `a / b`: truncated toward zero; a RangeError for a zero divisor. */
        fun divide(a: JSBigInt, b: JSBigInt): JSBigInt {
            if (b.isZero) throw JSException(JSRangeError("Division by zero"))
            return JSBigInt(a.value.divide(b.value))
        }

        /** `a % b`: the remainder takes the dividend's sign. */
        fun remainder(a: JSBigInt, b: JSBigInt): JSBigInt {
            if (b.isZero) throw JSException(JSRangeError("Division by zero"))
            return JSBigInt(a.value.rem(b.value))
        }

        /** `a ** b`: a RangeError for a negative exponent. */
        fun power(a: JSBigInt, b: JSBigInt): JSBigInt {
            if (b.value.signum() < 0) throw JSException(JSRangeError("Exponent must be positive"))
            return JSBigInt(a.value.pow(b.value.toInt()))
        }

        /** `a << b` (a negative `b` shifts right). */
        fun shiftLeft(a: JSBigInt, b: JSBigInt) = JSBigInt(a.value.shiftLeft(b.value.toInt()))

        /** `a >> b`: rounds toward negative infinity. */
        fun shiftRight(a: JSBigInt, b: JSBigInt) = JSBigInt(a.value.shiftRight(b.value.toInt()))

        /** `BigInt.asUintN(bits, value)`. */
        fun asUintN(bits: Double, v: JSBigInt): JSBigInt = JSBigInt(v.value.and(BigInteger.ONE.shiftLeft(bits.toInt()).subtract(BigInteger.ONE)))

        /** `BigInt.asIntN(bits, value)`. */
        fun asIntN(bits: Double, v: JSBigInt): JSBigInt {
            val n = bits.toInt()
            if (n == 0) return JSBigInt(0L)
            val u = asUintN(bits, v).value
            return JSBigInt(if (u.testBit(n - 1)) u.subtract(BigInteger.ONE.shiftLeft(n)) else u)
        }

        /** A BigInt against a number, as `<` and `==` compare them: exactly, NaN unordered. */
        fun compare(a: JSBigInt, d: Double): Int? {
            if (d.isNaN()) return null
            if (d == Double.POSITIVE_INFINITY) return -1
            if (d == Double.NEGATIVE_INFINITY) return 1
            return java.math.BigDecimal(a.value).compareTo(java.math.BigDecimal(d))
        }
    }
}

/** `typeof`, printing and equality see a BigInt as a value of its own. */
internal fun jsBigIntLooseEquals(a: JSBigInt, other: Any): Boolean = when (other) {
    is JSBigInt -> a == other
    is String -> try { JSBigInt.convert(other) == a } catch (_: JSException) { false }
    is Boolean -> a == JSBigInt(if (other) 1L else 0L)
    else -> jsNumeric(other)?.let { JSBigInt.compare(a, it) == 0 } ?: false
}

/** `bigint.toLocaleString(locales, options)`: its exact digits formatted as a number's are. */
fun jsBigIntToLocaleString(b: JSBigInt, locales: Any? = null, options: Any? = null): String {
    val digits = b.value.abs().toString()
    val d = if (b.isZero) JSDecimalDigits(mutableListOf(), 0) else JSDecimalDigits(digits.trimEnd('0').map { it - '0' }.toMutableList(), digits.length)
    return JSNumberFormat(locales, options).formatDecimal(d, b.value.signum() < 0)
}

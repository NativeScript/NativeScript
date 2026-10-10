package org.nativescript.kit

import java.math.BigInteger

/**
 * The shortest digits that read back as a double, the closest of them when several do, ties to
 * even (ECMAScript Number::toString's choice): Ryu (Adams, PLDI 2018), in 64-bit arithmetic.
 */
internal object JSShortestDouble {
    private const val POW5_INV_BITCOUNT = 125
    private const val POW5_BITCOUNT = 125
    private val pow5InvSplit = LongArray(2 * 342)
    private val pow5Split = LongArray(2 * 326)

    init {
        val mask = BigInteger.ONE.shiftLeft(64).subtract(BigInteger.ONE)
        for (i in 0 until 342) {
            val pow = BigInteger.valueOf(5).pow(i)
            val bits = pow.bitLength()
            val inv = BigInteger.ONE.shiftLeft(bits - 1 + POW5_INV_BITCOUNT).divide(pow).add(BigInteger.ONE)
            pow5InvSplit[2 * i] = inv.shiftRight(64).toLong()
            pow5InvSplit[2 * i + 1] = inv.and(mask).toLong()
            if (i < 326) {
                val split = pow.shiftRight(bits - POW5_BITCOUNT)
                pow5Split[2 * i] = split.shiftRight(64).toLong()
                pow5Split[2 * i + 1] = split.and(mask).toLong()
            }
        }
    }

    private fun pow5bits(e: Int): Int = ((e * 1217359) ushr 19) + 1
    private fun log10Pow2(e: Int): Int = (e * 78913) ushr 18
    private fun log10Pow5(e: Int): Int = (e * 732923) ushr 20

    private fun pow5Factor(value: Long): Int {
        var v = value
        var count = 0
        while (v != 0L && v % 5 == 0L) { v /= 5; count++ }
        return count
    }

    /** The high 64 bits of the unsigned 128-bit product. */
    private fun umulh(a: Long, b: Long): Long {
        val aLo = a and 0xFFFFFFFFL
        val aHi = a ushr 32
        val bLo = b and 0xFFFFFFFFL
        val bHi = b ushr 32
        val hiLo = aHi * bLo
        val cross = ((aLo * bLo) ushr 32) + (hiLo and 0xFFFFFFFFL) + aLo * bHi
        return aHi * bHi + (hiLo ushr 32) + (cross ushr 32)
    }

    /** (m × the 128-bit table entry at `at`) >> j, for 64 ≤ j < 128 and a product that fits. */
    private fun mulShift(m: Long, table: LongArray, at: Int, j: Int): Long {
        val hi = table[at]
        val lo = table[at + 1]
        val b0Hi = umulh(m, lo)
        val b2Lo = m * hi
        val b2Hi = umulh(m, hi)
        val sumLo = b2Lo + b0Hi
        val sumHi = b2Hi + if (java.lang.Long.compareUnsigned(sumLo, b2Lo) < 0) 1 else 0
        val dist = j - 64
        return if (dist == 0) sumLo else (sumHi shl (64 - dist)) or (sumLo ushr dist)
    }

    /** The digits of a finite positive double and n, where value = 0.digits × 10^n; no trailing zeros. */
    fun digits(value: Double): Pair<String, Int> {
        val bits = java.lang.Double.doubleToRawLongBits(value)
        val ieeeMantissa = bits and ((1L shl 52) - 1)
        val ieeeExponent = ((bits ushr 52) and 0x7FF).toInt()
        val e2: Int
        val m2: Long
        if (ieeeExponent == 0) {
            e2 = 1 - 1023 - 52 - 2
            m2 = ieeeMantissa
        } else {
            e2 = ieeeExponent - 1023 - 52 - 2
            m2 = (1L shl 52) or ieeeMantissa
        }
        val acceptBounds = (m2 and 1L) == 0L
        val mv = 4 * m2
        val mmShift = if (ieeeMantissa != 0L || ieeeExponent <= 1) 1 else 0

        var vr: Long
        var vp: Long
        var vm: Long
        val e10: Int
        var vmIsTrailingZeros = false
        var vrIsTrailingZeros = false
        if (e2 >= 0) {
            val q = log10Pow2(e2) - if (e2 > 3) 1 else 0
            e10 = q
            val k = POW5_INV_BITCOUNT + pow5bits(q) - 1
            val i = -e2 + q + k
            vr = mulShift(4 * m2, pow5InvSplit, 2 * q, i)
            vp = mulShift(4 * m2 + 2, pow5InvSplit, 2 * q, i)
            vm = mulShift(4 * m2 - 1 - mmShift, pow5InvSplit, 2 * q, i)
            if (q <= 21) {
                if (mv % 5 == 0L) vrIsTrailingZeros = pow5Factor(mv) >= q
                else if (acceptBounds) vmIsTrailingZeros = pow5Factor(mv - 1 - mmShift) >= q
                else vp -= if (pow5Factor(mv + 2) >= q) 1 else 0
            }
        } else {
            val q = log10Pow5(-e2) - if (-e2 > 1) 1 else 0
            e10 = q + e2
            val i = -e2 - q
            val k = pow5bits(i) - POW5_BITCOUNT
            val j = q - k
            vr = mulShift(4 * m2, pow5Split, 2 * i, j)
            vp = mulShift(4 * m2 + 2, pow5Split, 2 * i, j)
            vm = mulShift(4 * m2 - 1 - mmShift, pow5Split, 2 * i, j)
            if (q <= 1) {
                vrIsTrailingZeros = true
                if (acceptBounds) vmIsTrailingZeros = mmShift == 1 else vp--
            } else if (q < 63) {
                vrIsTrailingZeros = (mv and ((1L shl q) - 1)) == 0L
            }
        }

        var removed = 0
        var lastRemovedDigit = 0
        val output: Long
        if (vmIsTrailingZeros || vrIsTrailingZeros) {
            while (vp / 10 > vm / 10) {
                vmIsTrailingZeros = vmIsTrailingZeros and (vm % 10 == 0L)
                vrIsTrailingZeros = vrIsTrailingZeros and (lastRemovedDigit == 0)
                lastRemovedDigit = (vr % 10).toInt()
                vr /= 10; vp /= 10; vm /= 10
                removed++
            }
            if (vmIsTrailingZeros) {
                while (vm % 10 == 0L) {
                    vrIsTrailingZeros = vrIsTrailingZeros and (lastRemovedDigit == 0)
                    lastRemovedDigit = (vr % 10).toInt()
                    vr /= 10; vp /= 10; vm /= 10
                    removed++
                }
            }
            if (vrIsTrailingZeros && lastRemovedDigit == 5 && vr % 2 == 0L) lastRemovedDigit = 4
            output = vr + if ((vr == vm && (!acceptBounds || !vmIsTrailingZeros)) || lastRemovedDigit >= 5) 1 else 0
        } else {
            var roundUp = false
            while (vp / 10 > vm / 10) {
                roundUp = vr % 10 >= 5
                vr /= 10; vp /= 10; vm /= 10
                removed++
            }
            output = vr + if (vr == vm || roundUp) 1 else 0
        }
        var digits = output.toString()
        var exp = e10 + removed
        var end = digits.length
        while (end > 1 && digits[end - 1] == '0') { end--; exp++ }
        if (end < digits.length) digits = digits.substring(0, end)
        return Pair(digits, digits.length + exp)
    }
}

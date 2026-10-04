import org.nativescript.kit.ColorMix

fun main() {
    while (true) {
        val line = readLine() ?: break
        println(ColorMix.argb(line)?.let { (it.toLong() and 0xffffffffL).toString() } ?: "nil")
    }
}

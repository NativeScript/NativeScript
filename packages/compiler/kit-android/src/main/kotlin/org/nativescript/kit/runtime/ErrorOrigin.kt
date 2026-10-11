package org.nativescript.kit

/**
 * Where a JSError was made: the JVM stack, recorded when the error is made (as V8 records one for every error) and
 * formatted only when `stack` is read, as `    at <class>.<method>(<file>:<line>)`. In a minified release those
 * frames are R8's names: `ns-native-retrace` maps them back through mapping.txt, then to TypeScript lines.
 */
internal class ErrorOrigin : Throwable(null, null, false, true) {
    fun frames(): String {
        val loader = JSError::class.java.classLoader
        val frames = stackTrace.dropWhile { frame ->
            frame.className == ErrorOrigin::class.java.name || runCatching { JSError::class.java.isAssignableFrom(Class.forName(frame.className, false, loader)) }.getOrDefault(false)
        }
        if (frames.isEmpty()) return "    at <anonymous>"
        return frames.take(24).joinToString("\n") { "    at ${it.className}.${it.methodName}(${it.fileName ?: "Unknown Source"}:${it.lineNumber})" }
    }
}

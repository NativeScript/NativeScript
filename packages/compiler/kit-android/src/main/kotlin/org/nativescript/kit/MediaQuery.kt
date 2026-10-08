package org.nativescript.kit

/**
 * css-mediaquery's `matchQuery` with the values media-query-list's
 * `checkIfMediaQueryMatches` passes: screen size in device pixels,
 * orientation and color scheme. An invalid query never matches.
 */
object MediaQuery {
    private class Feature(val modifier: String?, val property: String, val value: String)
    private class Expression(val inverse: Boolean, val type: String, val features: List<Feature>)

    fun matches(query: String): Boolean {
        val metrics = NativeScriptActivity.context.resources.displayMetrics
        val width = metrics.widthPixels.toDouble()
        val height = metrics.heightPixels.toDouble()
        val values = mapOf<String, Any>(
            "type" to "screen",
            "width" to width, "height" to height, "device-width" to width, "device-height" to height,
            "orientation" to Appearance.orientation,
            "prefers-color-scheme" to Appearance.systemAppearance,
        )
        val expressions = parse(query) ?: return false
        return expressions.any { expression ->
            val typeMatch = expression.type == "all" || expression.type == "screen"
            if ((typeMatch && expression.inverse) || !(typeMatch || expression.inverse)) return@any false
            val featuresMatch = expression.features.all { feature ->
                val value = values[feature.property] ?: return@all false
                when (feature.property) {
                    "orientation", "prefers-color-scheme" -> (value as? String)?.lowercase() == feature.value.lowercase()
                    "width", "height", "device-width", "device-height" -> {
                        val number = value as? Double ?: return@all false
                        val target = Length.parse(feature.value, Length.zero).toDevicePixels(0.0)
                        when (feature.modifier) {
                            "min" -> number >= target
                            "max" -> number <= target
                            else -> number == target
                        }
                    }
                    else -> false
                }
            }
            featuresMatch != expression.inverse
        }
    }

    private val queryPattern = Regex("^(?:(only|not)?\\s*([_a-z][_a-z0-9-]*)|(\\([^)]+\\)))(?:\\s*and\\s*(.*))?$", RegexOption.IGNORE_CASE)
    private val featurePattern = Regex("\\([^)]+\\)")
    private val expressionPattern = Regex("^\\(\\s*([_a-z-][_a-z0-9-]*)\\s*(?::\\s*([^)]+))?\\s*\\)$", RegexOption.IGNORE_CASE)

    /** `parseQuery`; null where it would throw. */
    private fun parse(mediaQuery: String): List<Expression>? {
        val result = mutableListOf<Expression>()
        for (raw in mediaQuery.split(",")) {
            val query = raw.trim()
            val match = queryPattern.find(query) ?: return null
            val modifier = match.groups[1]?.value
            val type = match.groups[2]?.value
            val knownTypes = listOf("all", "print", "screen")
            val features = mutableListOf<Feature>()
            val featureString = ((match.groups[3]?.value ?: "") + (match.groups[4]?.value ?: "")).trim()
            if (featureString.isNotEmpty()) {
                val found = featurePattern.findAll(featureString).toList()
                if (found.isEmpty()) return null
                for (feature in found) {
                    val captures = expressionPattern.find(feature.value) ?: return null
                    val name = captures.groups[1]!!.value.lowercase()
                    val value = captures.groups[2]?.value ?: ""
                    when {
                        name.startsWith("min-") -> features.add(Feature("min", name.substring(4), value))
                        name.startsWith("max-") -> features.add(Feature("max", name.substring(4), value))
                        else -> features.add(Feature(null, name, value))
                    }
                }
            }
            result.add(Expression(modifier?.lowercase() == "not", type?.lowercase()?.takeIf { it in knownTypes } ?: "all", features))
        }
        return result
    }
}

package org.nativescript.kit

// The code generator's vocabulary (what compiled templates call), as the hand port has it; a -PgeneratedKit
// build has it over the classes compiled from core instead (src/fromcore/CoreBridge.kt).

fun View.kitAddChild(child: View) = addChild(child)
fun View.kitAddTemplateChild(child: View) = addTemplateChild(child)
fun View.kitSet(name: String, value: Any?) = set(name, value)
fun View.kitOn(eventName: String, handler: (EventData) -> Unit) = on(eventName, handler)

fun LayoutBase.kitAddRegion(): Region = addRegion()
fun LayoutBase.kitAddRegion(region: Region): Region = addRegion(region)
fun FormattedString.kitAddRegion(): Region = addRegion()

/** `$navigateTo(Component)`: the topmost frame shows the view the template makes. */
fun kitNavigate(create: () -> View) {
    Frame.topmost()?.navigate(create)
}

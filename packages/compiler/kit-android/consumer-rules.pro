# Material is compileOnly: present only in apps that use core's Material-drawn views.
-dontwarn com.google.android.material.**
# The kit's own classes are kept by the app's proguard-rules.pro (android.ts kitKeepRules), whole or narrowed.
# Core checks for Material by this name before drawing a TabView's navigation with it.
-keepnames class com.google.android.material.navigation.NavigationBarView
# Core reads theme attributes by name (Utils.android.resources.getPaletteColor).
-keep class androidx.appcompat.R$attr { public static <fields>; }

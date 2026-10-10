# Material is compileOnly: present only in apps that use core's Material-drawn views.
-dontwarn com.google.android.material.**
# Script reaches classes and members by name through reflection (`new PagerAdapter(owner)`, prototypes by class, accessors by getter name).
-keep class org.nativescript.** { *; }
# Core checks for Material by this name before drawing a TabView's navigation with it.
-keepnames class com.google.android.material.navigation.NavigationBarView

# Material is compileOnly: present only in apps that use core's Material-drawn views.
-dontwarn com.google.android.material.**
# Script constructs classes held as values (`new PagerAdapter(owner)`) through their constructors, by reflection.
-keepclassmembers class org.nativescript.kit.** { <init>(...); }

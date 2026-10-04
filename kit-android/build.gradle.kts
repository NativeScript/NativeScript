plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "org.nativescript.kit"
    compileSdk = 36

    defaultConfig {
        minSdk = 24
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

kotlin {
    compilerOptions { jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17) }
}

// The app's own @nativescript/core widgets AAR: the layout code NativeScript runs on Android.
val widgetsAar: String = providers.gradleProperty("nativescriptWidgetsAar").get()

// The AndroidX versions a NativeScript 9.1 release build resolves, so shared widgets look the same.
dependencies {
    api(files(widgetsAar))
    api("androidx.appcompat:appcompat:1.7.0")
    api("androidx.activity:activity:1.8.1")
    api("androidx.fragment:fragment:1.8.5")
    api("androidx.core:core:1.13.0")
    implementation("androidx.transition:transition:1.5.1")
    implementation("androidx.exifinterface:exifinterface:1.3.7")
}

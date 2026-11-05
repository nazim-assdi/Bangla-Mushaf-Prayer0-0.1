## Android APK build

This project is a React/Vite web app packaged for Android with Capacitor.

- Android application ID: `com.nazimassdi.banglamushaf`
- Build locally: `npm install`, `npm run build`, `npx cap add android`, `npx cap sync android`, then run `cd android && ./gradlew assembleDebug`.
- GitHub Actions builds a **debug APK** on every push and on manual workflow dispatch.
- Download the APK from the workflow run's **Artifacts** section. Debug APK is for testing/sideloading, not a Play Store release.
- Google sign-in, GPS/compass sensors, audio playback, and API/backend-dependent functions must be tested on a real Android phone. A release-signed APK/AAB and Play Store configuration are separate steps.

## Launcher icon

The Android launcher icon artwork is sourced from `public/icon.jpg`. The GitHub Actions build generates legacy, adaptive, and round launcher resources from that image. The adaptive foreground uses the dedicated `@drawable/quran_launcher_foreground` resource to avoid resource-name collisions.

## Multi-platform release builds

The GitHub Actions workflow `.github/workflows/release-all-platforms.yml` builds these artifacts together:

- Android: release APK (signed using a repository keystore when configured; otherwise signed with a temporary CI key for testing) and debug APK.
- Windows: NSIS installer and portable EXE.
- macOS: DMG and ZIP package (unsigned; notarization is not configured).
- Linux: AppImage and DEB package.
- iPhone/iOS: unsigned device IPA package. Apple Developer signing and provisioning are required before it can be installed on a physical iPhone or distributed.

Open the workflow's Artifacts section to download each platform package. Do not use the temporary Android CI signing key for future upgrades; configure `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEY_ALIAS`, `ANDROID_KEYSTORE_PASSWORD`, and `ANDROID_KEY_PASSWORD` repository secrets to keep one persistent signing identity.

## Android APK build

This project is a React/Vite web app packaged for Android with Capacitor.

- Android application ID: `com.nazimassdi.banglamushaf`
- Build locally: `npm install`, `npm run build`, `npx cap add android`, `npx cap sync android`, then run `cd android && ./gradlew assembleDebug`.
- GitHub Actions builds a **debug APK** on every push and on manual workflow dispatch.
- Download the APK from the workflow run's **Artifacts** section. Debug APK is for testing/sideloading, not a Play Store release.
- Google sign-in, GPS/compass sensors, audio playback, and API/backend-dependent functions must be tested on a real Android phone. A release-signed APK/AAB and Play Store configuration are separate steps.

#!/bin/sh
# Builds the signed Android App Bundle (.aab) to upload to Google Play.
#
# The upload key lives outside the repo, in ~/Documents/bunker-now-firma/,
# and its password in the macOS Keychain (service "bunker-now-upload-keystore").
# Back up both: without the upload key, Google has to reset it before the
# next update can be published.
#
# Usage: npm run build:release
set -e
cd "$(dirname "$0")/.."

export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@21}"
export ANDROID_HOME="${ANDROID_HOME:-/opt/homebrew/share/android-commandlinetools}"
export BUNKER_KEYSTORE="${BUNKER_KEYSTORE:-$HOME/Documents/bunker-now-firma/bunker-now-upload.jks}"
BUNKER_KEYSTORE_PASSWORD="$(security find-generic-password -s bunker-now-upload-keystore -w)"
export BUNKER_KEYSTORE_PASSWORD

npm run build:app
npx cap sync android
(cd android && ./gradlew bundleRelease)

echo
echo "Upload this file to Google Play:"
echo "  android/app/build/outputs/bundle/release/app-release.aab"

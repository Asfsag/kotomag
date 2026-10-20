#!/bin/bash
# Builds dist/Kotomag.app (macOS) from the sources: needs `npm install` first and Xcode command line tools (clang, codesign).
# Usage: bash scripts/build-mac.sh        Result: dist/Kotomag.app and dist/Kotomag-mac.zip
set -e
cd "$(dirname "$0")/.."
V=$(node -p "require('./package.json').version")
EL="node_modules/electron/dist/Electron.app"
[ -d "$EL" ] || { echo "Run 'npm install' first (Electron is missing)"; exit 1; }
rm -rf dist/Kotomag.app; mkdir -p dist
cp -R "$EL" dist/Kotomag.app
APP="dist/Kotomag.app/Contents/Resources/app"; mkdir -p "$APP"
cp -R src/* "$APP"/
cp build/icon.png "$APP/icon.png"
cat > "$APP/package.json" <<JSON
{ "name": "kotomag", "productName": "Kotomag", "version": "$V", "main": "main.js", "author": "Asfsag" }
JSON
# helper that polls the hotkey state (works without special macOS permissions)
clang -O2 -arch arm64 -arch x86_64 -framework ApplicationServices -o "$APP/kotomag-keys" native/keys.c 2>/dev/null || clang -O2 -framework ApplicationServices -o "$APP/kotomag-keys" native/keys.c
# icon
T=$(mktemp -d); mkdir "$T/icon.iconset"
for s in 16 32 128 256 512; do sips -z $s $s build/icon.png --out "$T/icon.iconset/icon_${s}x${s}.png" >/dev/null; sips -z $((s*2)) $((s*2)) build/icon.png --out "$T/icon.iconset/icon_${s}x${s}@2x.png" >/dev/null; done
iconutil -c icns "$T/icon.iconset" -o dist/Kotomag.app/Contents/Resources/electron.icns; rm -rf "$T"
# bundle metadata: no Dock icon, own identifier
P="dist/Kotomag.app/Contents/Info.plist"
/usr/libexec/PlistBuddy -c "Set :CFBundleName Kotomag" -c "Set :CFBundleDisplayName Kotomag" -c "Set :CFBundleIdentifier io.github.asfsag.kotomag" -c "Set :CFBundleShortVersionString $V" -c "Set :CFBundleVersion $V" "$P"
/usr/libexec/PlistBuddy -c "Add :LSUIElement bool true" "$P" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :NSAppleEventsUsageDescription string Kotomag asks Finder how many files are in the Trash" "$P" 2>/dev/null || true
# leave out unused things: other languages, the default app
rm -rf dist/Kotomag.app/Contents/Resources/default_app.asar
find dist/Kotomag.app/Contents/Resources -maxdepth 1 -name '*.lproj' ! -name 'en.lproj' ! -name 'ru.lproj' -exec rm -rf {} +
codesign --force --deep --sign - dist/Kotomag.app
ditto -c -k --keepParent dist/Kotomag.app dist/Kotomag-mac.zip
echo "Done: dist/Kotomag.app, dist/Kotomag-mac.zip (v$V)"

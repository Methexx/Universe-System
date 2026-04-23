# Universe App

Universe App is a cross-platform Flutter application. This repository contains the source for mobile, web, and desktop builds from a single codebase.

## Highlights
- Fast cross-platform UI built with Flutter.
- Shared code across Android, iOS, web, macOS, Windows, and Linux.
- Clean project structure and standard Flutter tooling.

## Requirements
- Flutter SDK (compatible with Dart `^3.10.1`)
- Platform-specific toolchains:
- Android: Android Studio / SDK
- iOS: Xcode (macOS only)
- Web/Desktop: Chrome or native desktop toolchains

## Quick Start
1. Install dependencies:
```
flutter pub get
```
1. Run the app:
```
flutter run
```

## Common Commands
- Run tests:
```
flutter test
```
- Analyze:
```
flutter analyze
```
- Format all Dart files:
```
dart format .
```
- Build for release:
```
flutter build apk
```
```
flutter build ios
```
```
flutter build web
```

## Git Hook Automation (No Husky)
This project includes a native Git pre-commit hook at `.githooks/pre-commit`.

What it does on each commit:
- Formats staged `.dart` files with `dart format`
- Re-stages formatted files automatically

What it does on each push:
- Runs `flutter test` before pushing

One-time setup per clone (PowerShell on Windows):
```
./scripts/setup-git-hooks.ps1
```

Alternative setup (any shell):
```
git config core.hooksPath .githooks
```

Optional behavior:
- Skip all hook logic for one commit:
```
SKIP_FLUTTER_HOOKS=1 git commit -m "your message"
```
PowerShell:
```
$env:SKIP_FLUTTER_HOOKS=1; git commit -m "your message"; Remove-Item Env:SKIP_FLUTTER_HOOKS
```
- Skip all hook logic for one push:
```
SKIP_FLUTTER_HOOKS=1 git push
```
PowerShell:
```
$env:SKIP_FLUTTER_HOOKS=1; git push; Remove-Item Env:SKIP_FLUTTER_HOOKS
```
- Also run analyze during commit:
```
RUN_FLUTTER_ANALYZE=1 git commit -m "your message"
```
PowerShell:
```
$env:RUN_FLUTTER_ANALYZE=1; git commit -m "your message"; Remove-Item Env:RUN_FLUTTER_ANALYZE
```

## Project Structure
- `lib/` Application code
- `test/` Unit and widget tests
- `android/` Android runner and build config
- `ios/` iOS runner and build config
- `web/` Web build configuration
- `windows/`, `macos/`, `linux/` Desktop runners

## Configuration
- App metadata and dependencies live in `pubspec.yaml`.
- Lint rules are in `analysis_options.yaml`.

## Versioning
Current app version is defined in `pubspec.yaml` as `1.0.0+1`.

## Roadmap
- Add a short product description and screenshots.
- Document app features and any required runtime configuration.
- Add CI and release instructions.

## License
Proprietary. All rights reserved.

# CLAUDE.md

## Release process

Before tagging a release (`v<x.y.z>`), bump the embedded version in **all** of these files in a single PR, then tag the merge commit:

- `package.json` — top-level `"version"`
- `package-lock.json` — top-level `"version"` and the empty-string package entry `packages[""].version`
- `src-tauri/Cargo.toml` — `[package].version`
- `src-tauri/Cargo.lock` — the `markdown-editor` package entry's `version`
- `src-tauri/tauri.conf.json` — top-level `"version"`

All five must match the tag you're about to push. If any are stale, the binary reports the wrong version at runtime and the Tauri auto-updater will not recognise new releases as upgrades (semver treats pre-releases as lower precedence than releases, so e.g. `1.0.0-rc10 < 1.0.0`).

Use plain semver (`v1.0.1`, `v1.0.2`, `v2.0.0`) — not `-rcN` pre-release suffixes — so the updater's comparison works cleanly.

## Updater pipeline

`release-desktop.yml` fires on `v*` tag push. Required for the auto-updater to reach users:

- `TAURI_SIGNING_PRIVATE_KEY` and `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` secrets must be set (they are).
- `publish-release` job generates `latest.json` from tag version; updater endpoint is `https://github.com/andyjmorgan/DonkeyWork-MarkdownEditor/releases/latest/download/latest.json`.
- macOS notarization requires the Apple Developer Program License Agreement to be current — if notarize 403s, the Account Holder must accept the pending agreement at https://appstoreconnect.apple.com/agreements/ (this is separate from membership renewal).

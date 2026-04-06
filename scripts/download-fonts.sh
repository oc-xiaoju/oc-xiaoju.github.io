#!/usr/bin/env bash
# Download fonts needed for OG image generation
set -e

FONT_DIR="src/assets/fonts"
FONT_FILE="$FONT_DIR/NotoSansSC-Regular.ttf"

if [ -f "$FONT_FILE" ] && [ "$(wc -c < "$FONT_FILE")" -gt 10000 ]; then
  echo "✅ Font already exists: $FONT_FILE ($(du -h "$FONT_FILE" | cut -f1))"
  exit 0
fi

echo "📥 Downloading Noto Sans SC (static, ~2.5MB)..."
mkdir -p "$FONT_DIR"
curl -L -o "$FONT_FILE" \
  "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-sc@latest/chinese-simplified-400-normal.ttf"

echo "✅ Font downloaded: $(du -h "$FONT_FILE" | cut -f1)"

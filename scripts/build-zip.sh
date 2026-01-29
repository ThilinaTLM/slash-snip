#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$PROJECT_ROOT/dist"

cd "$PROJECT_ROOT"

echo "Building extension..."
pnpm build

VERSION=$(grep '"version"' "$DIST_DIR/manifest.json" | sed 's/.*"version": *"\([^"]*\)".*/\1/')
ZIP_NAME="slashsnip-${VERSION}.zip"

echo "Creating $ZIP_NAME..."
cd "$DIST_DIR"
rm -f "$ZIP_NAME"
zip -r "$ZIP_NAME" . -x "$ZIP_NAME"

echo "Done! Created $DIST_DIR/$ZIP_NAME"

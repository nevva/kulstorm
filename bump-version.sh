#!/bin/sh
# Stamp a new version into docs/index.html and docs/version.json so open browsers reload into it.
set -e
cd "$(dirname "$0")"
v="${1:-$(date -u +%Y.%m.%d-%H%M)}"
sed -i "s/^const VERSION='[^']*';/const VERSION='$v';/" docs/index.html
printf '{"version":"%s"}\n' "$v" > docs/version.json
grep -q "^const VERSION='$v';" docs/index.html
echo "Version $v"

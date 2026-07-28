#!/usr/bin/env bash
# Scans the `source` branch's source/_posts for Octopress/Liquid tags,
# without needing to check that branch out. Run this from inside your
# arnabc.github.io repo (any branch is fine).

set -euo pipefail

BRANCH="source"
POSTS_PATH="source/_posts"

echo "Listing post files on branch '$BRANCH'..."
files=$(git ls-tree -r --name-only "$BRANCH" -- "$POSTS_PATH")

if [ -z "$files" ]; then
  echo "No files found under $POSTS_PATH on branch $BRANCH. Check the path/branch name."
  exit 1
fi

count=$(echo "$files" | wc -l | tr -d ' ')
echo "Found $count post files."
echo

echo "=== Distinct Liquid/Octopress tags in use (with counts) ==="
# Matches {% tagname ... %} and {% endtagname %}
echo "$files" | while read -r f; do
  git show "$BRANCH:$f"
done | grep -oE '\{%[[:space:]]*[a-zA-Z_]+' \
     | sed -E 's/\{%[[:space:]]*//' \
     | sort | uniq -c | sort -rn

echo
echo "=== One example usage per tag (first match, with source file) ==="
tags=$(echo "$files" | while read -r f; do git show "$BRANCH:$f"; done \
       | grep -oE '\{%[[:space:]]*[a-zA-Z_]+' | sed -E 's/\{%[[:space:]]*//' \
       | sort -u)

for tag in $tags; do
  echo "--- $tag ---"
  echo "$files" | while read -r f; do
    match=$(git show "$BRANCH:$f" | grep -m1 -E "\{%[[:space:]]*${tag}\b" || true)
    if [ -n "$match" ]; then
      echo "File: $f"
      echo "  $match"
      break
    fi
  done
  echo
done

echo "=== Posts with NO Liquid tags (safe direct converts) ==="
echo "$files" | while read -r f; do
  if ! git show "$BRANCH:$f" | grep -qE '\{%'; then
    echo "$f"
  fi
done

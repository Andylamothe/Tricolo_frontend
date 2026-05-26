#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  ./scripts/link-tricolo-repos.sh \
    --mode <monorepo|submodules> \
    --target-dir <absolute-or-relative-path> \
    --frontend-url <git-url> \
    --backend-url <git-url> \
    --iot-url <git-url> \
    [--frontend-branch <name>] \
    [--backend-branch <name>] \
    [--iot-branch <name>] \
    [--preserve-history <true|false>]

Description:
  Creates a Tricolo root repository and links 3 repositories under apps/:
  - apps/frontend
  - apps/backend
  - apps/iot

Options:
  --mode              monorepo (git subtree) or submodules (git submodule)
  --target-dir        Folder where the Tricolo root repository will be created
  --frontend-url      Git URL for frontend repository
  --backend-url       Git URL for backend repository
  --iot-url           Git URL for IoT repository
  --frontend-branch   Branch for frontend repository (default: main)
  --backend-branch    Branch for backend repository (default: main)
  --iot-branch        Branch for IoT repository (default: main)
  --preserve-history  For --mode monorepo only.
                      true  -> keep full history (default)
                      false -> squash import history
USAGE
}

MODE=""
TARGET_DIR=""
FRONTEND_URL=""
BACKEND_URL=""
IOT_URL=""
FRONTEND_BRANCH="main"
BACKEND_BRANCH="main"
IOT_BRANCH="main"
PRESERVE_HISTORY="true"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      MODE="$2"
      shift 2
      ;;
    --target-dir)
      TARGET_DIR="$2"
      shift 2
      ;;
    --frontend-url)
      FRONTEND_URL="$2"
      shift 2
      ;;
    --backend-url)
      BACKEND_URL="$2"
      shift 2
      ;;
    --iot-url)
      IOT_URL="$2"
      shift 2
      ;;
    --frontend-branch)
      FRONTEND_BRANCH="$2"
      shift 2
      ;;
    --backend-branch)
      BACKEND_BRANCH="$2"
      shift 2
      ;;
    --iot-branch)
      IOT_BRANCH="$2"
      shift 2
      ;;
    --preserve-history)
      PRESERVE_HISTORY="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$MODE" || -z "$TARGET_DIR" || -z "$FRONTEND_URL" || -z "$BACKEND_URL" || -z "$IOT_URL" ]]; then
  echo "Missing required argument(s)." >&2
  usage
  exit 1
fi

if [[ "$MODE" != "monorepo" && "$MODE" != "submodules" ]]; then
  echo "Invalid --mode: $MODE (expected: monorepo or submodules)" >&2
  exit 1
fi

if [[ "$PRESERVE_HISTORY" != "true" && "$PRESERVE_HISTORY" != "false" ]]; then
  echo "Invalid --preserve-history: $PRESERVE_HISTORY (expected: true or false)" >&2
  exit 1
fi

mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR"

if [[ ! -d .git ]]; then
  git init
fi

if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  git commit --allow-empty -m "chore: initialize tricolo root"
fi

mkdir -p apps

link_submodule() {
  local name="$1"
  local url="$2"
  local branch="$3"
  local path="apps/$name"

  if git config --file .gitmodules --get-regexp "^submodule\.${path}\.path$" >/dev/null 2>&1; then
    echo "Submodule already configured at ${path}, skipping add."
    return 0
  fi

  if [[ -e "$path" ]]; then
    echo "Path already exists (${path}); remove it first or choose another target directory." >&2
    exit 1
  fi

  git submodule add -b "$branch" "$url" "$path"
}

link_subtree() {
  local name="$1"
  local url="$2"
  local branch="$3"
  local path="apps/$name"

  if [[ -e "$path" ]]; then
    echo "Path already exists (${path}), skipping import."
    return 0
  fi

  if [[ "$PRESERVE_HISTORY" == "true" ]]; then
    git subtree add --prefix="$path" "$url" "$branch"
  else
    git subtree add --prefix="$path" "$url" "$branch" --squash
  fi
}

if [[ "$MODE" == "submodules" ]]; then
  link_submodule "frontend" "$FRONTEND_URL" "$FRONTEND_BRANCH"
  link_submodule "backend" "$BACKEND_URL" "$BACKEND_BRANCH"
  link_submodule "iot" "$IOT_URL" "$IOT_BRANCH"
  git submodule update --init --recursive
else
  link_subtree "frontend" "$FRONTEND_URL" "$FRONTEND_BRANCH"
  link_subtree "backend" "$BACKEND_URL" "$BACKEND_BRANCH"
  link_subtree "iot" "$IOT_URL" "$IOT_BRANCH"
fi

cat > REPOSITORIES.md <<DOC
# Tricolo repository map

- apps/frontend -> ${FRONTEND_URL} (${FRONTEND_BRANCH})
- apps/backend  -> ${BACKEND_URL} (${BACKEND_BRANCH})
- apps/iot      -> ${IOT_URL} (${IOT_BRANCH})

Mode: ${MODE}
Preserve history (monorepo only): ${PRESERVE_HISTORY}
DOC

echo "Done. Tricolo root prepared at: $(pwd)"

#!/bin/bash

# Script to run type-check only on packages that have changes
# Detects staged files (--cached) and modified files (working tree)

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to get changed files
get_changed_files() {
  # Staged files (ready for commit)
  git diff --cached --name-only --diff-filter=ACM 2>/dev/null
  
  # Modified files in working tree
  git diff --name-only --diff-filter=ACM 2>/dev/null
}

# Function to extract changed packages from files
get_changed_packages() {
  local changed_files="$1"
  local packages=()
  
  while IFS= read -r file; do
    # Ignore empty files
    [ -z "$file" ] && continue
    
    # Extract package name from path
    if [[ "$file" =~ ^packages/([^/]+)/ ]]; then
      local package="${BASH_REMATCH[1]}"
      # Add only if not already in the list
      if [[ ! " ${packages[*]} " =~ " ${package} " ]]; then
        packages+=("$package")
      fi
    fi
  done <<< "$changed_files"
  
  echo "${packages[@]}"
}

# Function to run type-check on a package
type_check_package() {
  local package="$1"
  local tsconfig_path="packages/$package/tsconfig.json"
  
  if [ ! -f "$tsconfig_path" ]; then
    echo -e "${YELLOW}⚠️  Package $package does not have tsconfig.json, skipping...${NC}"
    return 0
  fi
  
  echo -e "${GREEN}🔍 Type-checking package: $package${NC}"
  if bunx tsc --noEmit --project "$tsconfig_path"; then
    echo -e "${GREEN}✅ $package: OK${NC}"
    return 0
  else
    echo -e "${RED}❌ $package: ERROR${NC}"
    return 1
  fi
}

# Main
main() {
  echo -e "${GREEN}🔍 Detecting changed packages...${NC}"
  
  # Get changed files
  changed_files=$(get_changed_files | sort -u)
  
  # If no changed files, check if should run on all
  if [ -z "$changed_files" ]; then
    echo -e "${YELLOW}⚠️  No changed files detected.${NC}"
    echo -e "${YELLOW}   Running type-check on all packages...${NC}"
    # Fallback: run on all packages
    for dir in packages/*/; do
      package=$(basename "$dir")
      type_check_package "$package" || exit 1
    done
    exit 0
  fi
  
  # Extract changed packages
  changed_packages=($(get_changed_packages "$changed_files"))
  
  if [ ${#changed_packages[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ No changed packages detected.${NC}"
    exit 0
  fi
  
  echo -e "${GREEN}📦 Changed packages: ${changed_packages[*]}${NC}"
  echo ""
  
  # Run type-check on each changed package
  failed=0
  for package in "${changed_packages[@]}"; do
    type_check_package "$package" || failed=1
    echo ""
  done
  
  if [ $failed -eq 1 ]; then
    echo -e "${RED}❌ Type-check failed in one or more packages${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}✅ All type-checks passed!${NC}"
  exit 0
}

main "$@"


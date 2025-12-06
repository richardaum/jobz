#!/bin/bash

# Script para executar type-check apenas nos packages que tiveram alterações
# Detecta arquivos staged (--cached) e modificados (working tree)

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para obter arquivos alterados
get_changed_files() {
  # Arquivos staged (prontos para commit)
  git diff --cached --name-only --diff-filter=ACM 2>/dev/null
  
  # Arquivos modificados no working tree
  git diff --name-only --diff-filter=ACM 2>/dev/null
}

# Função para extrair packages alterados dos arquivos
get_changed_packages() {
  local changed_files="$1"
  local packages=()
  
  while IFS= read -r file; do
    # Ignora arquivos vazios
    [ -z "$file" ] && continue
    
    # Extrai o nome do package do caminho
    if [[ "$file" =~ ^packages/([^/]+)/ ]]; then
      local package="${BASH_REMATCH[1]}"
      # Adiciona apenas se ainda não estiver na lista
      if [[ ! " ${packages[*]} " =~ " ${package} " ]]; then
        packages+=("$package")
      fi
    fi
  done <<< "$changed_files"
  
  echo "${packages[@]}"
}

# Função para executar type-check em um package
type_check_package() {
  local package="$1"
  local tsconfig_path="packages/$package/tsconfig.json"
  
  if [ ! -f "$tsconfig_path" ]; then
    echo -e "${YELLOW}⚠️  Package $package não tem tsconfig.json, pulando...${NC}"
    return 0
  fi
  
  echo -e "${GREEN}🔍 Type-checking package: $package${NC}"
  if bunx tsc --noEmit --project "$tsconfig_path"; then
    echo -e "${GREEN}✅ $package: OK${NC}"
    return 0
  else
    echo -e "${RED}❌ $package: ERRO${NC}"
    return 1
  fi
}

# Main
main() {
  echo -e "${GREEN}🔍 Detectando packages alterados...${NC}"
  
  # Obtém arquivos alterados
  changed_files=$(get_changed_files | sort -u)
  
  # Se não houver arquivos alterados, verifica se deve rodar em todos
  if [ -z "$changed_files" ]; then
    echo -e "${YELLOW}⚠️  Nenhum arquivo alterado detectado.${NC}"
    echo -e "${YELLOW}   Executando type-check em todos os packages...${NC}"
    # Fallback: executa em todos os packages
    for dir in packages/*/; do
      package=$(basename "$dir")
      type_check_package "$package" || exit 1
    done
    exit 0
  fi
  
  # Extrai packages alterados
  changed_packages=($(get_changed_packages "$changed_files"))
  
  if [ ${#changed_packages[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ Nenhum package alterado detectado.${NC}"
    exit 0
  fi
  
  echo -e "${GREEN}📦 Packages alterados: ${changed_packages[*]}${NC}"
  echo ""
  
  # Executa type-check em cada package alterado
  failed=0
  for package in "${changed_packages[@]}"; do
    type_check_package "$package" || failed=1
    echo ""
  done
  
  if [ $failed -eq 1 ]; then
    echo -e "${RED}❌ Type-check falhou em um ou mais packages${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}✅ Todos os type-checks passaram!${NC}"
  exit 0
}

main "$@"


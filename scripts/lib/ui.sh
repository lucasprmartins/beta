#!/usr/bin/env bash
# ─── UI Library ──────────────────────────────────────────────────────────────
# Biblioteca compartilhada de interface para scripts do projeto.
# Uso: source "$SCRIPT_DIR/lib/ui.sh"

# ─── Cores ───────────────────────────────────────────────────────────────────

GREEN=$'\033[32m'
RED=$'\033[31m'
YELLOW=$'\033[33m'
CYAN=$'\033[36m'
BOLD=$'\033[1m'
DIM=$'\033[2m'
RESET=$'\033[0m'

# ─── Mensagens ───────────────────────────────────────────────────────────────

sucesso() { echo "${GREEN}✓${RESET} $1"; }
aviso()   { echo "${YELLOW}▪${RESET} $1"; }
info()    { echo "${DIM}$1${RESET}"; }

erro() {
  echo "${RED}✗${RESET} $1"
  exit 1
}

# ─── Prompts ─────────────────────────────────────────────────────────────────

pergunta_sn() {
  local resposta
  printf '%s?%s %s %s[y/N]%s > ' "${CYAN}" "${RESET}" "$1" "${DIM}" "${RESET}"
  read -r resposta
  [[ "$resposta" =~ ^[yY]$ ]]
}

pergunta() {
  echo "${CYAN}?${RESET} $1"
}

# ─── Layout ──────────────────────────────────────────────────────────────────

banner() {
  local texto="$1"
  local len=${#texto}
  local largura=$(( len + 7 ))
  local linha
  linha=$(printf '─%.0s' $(seq 1 "$largura"))

  echo ""
  echo "${DIM}╭${linha}╮${RESET}"
  echo "${DIM}│${RESET}  ${BOLD}◆  ${texto}${RESET}  ${DIM}│${RESET}"
  echo "${DIM}╰${linha}╯${RESET}"
  echo ""
}

titulo() {
  echo ""
  echo "${BOLD}$1${RESET}"
  echo "${DIM}────────────────────────────────────${RESET}"
  echo ""
}

separador() {
  echo ""
  echo "${DIM}────────────────────────────────────${RESET}"
  echo ""
}

rodape() {
  separador
  echo "${GREEN}✓${RESET} $1"
  echo ""
}

# ─── Spinner ─────────────────────────────────────────────────────────────────

spinner() {
  local pid=$1
  local msg="${2:-Aguardando...}"
  local frames=("⠋" "⠙" "⠹" "⠸" "⠼" "⠴" "⠦" "⠧" "⠇" "⠏")
  local i=0

  tput civis 2>/dev/null || true
  while kill -0 "$pid" 2>/dev/null; do
    printf '\r%s%s %s%s' "${DIM}" "${frames[$i]}" "${msg}" "${RESET}"
    i=$(( (i + 1) % ${#frames[@]} ))
    sleep 0.08
  done
  printf '\r\033[2K'
  tput cnorm 2>/dev/null || true
}

# ─── Setup ───────────────────────────────────────────────────────────────────

setup_root() {
  ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[1]}")/.." && pwd)"
  cd "$ROOT_DIR"
}

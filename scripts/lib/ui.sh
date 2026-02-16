#!/usr/bin/env bash
# ─── UI Library ──────────────────────────────────────────────────────────────
# Biblioteca compartilhada de interface para scripts do projeto.
# Uso: source "$SCRIPT_DIR/lib/ui.sh"

# ─── Cores ───────────────────────────────────────────────────────────────────

GREEN="\033[32m"
RED="\033[31m"
YELLOW="\033[33m"
CYAN="\033[36m"
BOLD="\033[1m"
DIM="\033[2m"
RESET="\033[0m"

# ─── Mensagens ───────────────────────────────────────────────────────────────

sucesso() { echo -e "${GREEN}✓${RESET} $1"; }
aviso()   { echo -e "${YELLOW}▪${RESET} $1"; }
info()    { echo -e "${DIM}$1${RESET}"; }

erro() {
  echo -e "${RED}✗${RESET} $1"
  exit 1
}

# ─── Prompts ─────────────────────────────────────────────────────────────────

pergunta_sn() {
  local resposta
  echo -ne "${CYAN}?${RESET} $1 ${DIM}[y/N]${RESET} > "
  read -r resposta
  [[ "$resposta" =~ ^[yY]$ ]]
}

pergunta() {
  echo -e "${CYAN}?${RESET} $1"
}

# ─── Layout ──────────────────────────────────────────────────────────────────

banner() {
  local texto="$1"
  local len
  len=$(printf '%s' "$texto" | wc -L)
  local largura=$(( len + 7 ))
  local linha
  linha=$(printf '─%.0s' $(seq 1 "$largura"))

  echo ""
  echo -e "${DIM}╭${linha}╮${RESET}"
  echo -e "${DIM}│${RESET}  ${BOLD}◆  ${texto}${RESET}  ${DIM}│${RESET}"
  echo -e "${DIM}╰${linha}╯${RESET}"
  echo ""
}

titulo() {
  echo ""
  echo -e "${BOLD}$1${RESET}"
  echo -e "${DIM}────────────────────────────────────${RESET}"
  echo ""
}

separador() {
  echo ""
  echo -e "${DIM}────────────────────────────────────${RESET}"
  echo ""
}

rodape() {
  separador
  echo -e "${GREEN}✓${RESET} $1"
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
    echo -ne "\r${DIM}${frames[$i]} ${msg}${RESET}"
    i=$(( (i + 1) % ${#frames[@]} ))
    sleep 0.08
  done
  echo -ne "\r\033[2K"
  tput cnorm 2>/dev/null || true
}

# ─── Setup ───────────────────────────────────────────────────────────────────

setup_root() {
  ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[1]}")/.." && pwd)"
  cd "$ROOT_DIR"
}

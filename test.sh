#!/data/data/com.termux/files/usr/bin/bash

# COLORES PREMIUM
C1='\e[38;5;51m'    # Cyan eléctrico
C2='\e[38;5;117m'   # Celeste suave
C3='\e[38;5;250m'   # Gris premium
R='\e[31m'
RESET='\e[0m'

clear

# BANNER
echo -e "${C1}"
echo "╔══════════════════════════════════════════════╗"
echo "║  ██╗░░██╗░░░░░░█████╗░░░░░░███╗░░██╗░░░░░███████╗░░░░░██╗░░██╗░░░░░██╗  ║"
echo "║  ██║░██╔╝░░░░░██╔══██╗░░░░░████╗░██║░░░░░██╔════╝░░░░░██║░██╔╝░░░░░██║  ║"
echo "║  █████═╝░░░░░░███████║░░░░░██╔██╗██║░░░░░█████╗░░░░░░░█████═╝░░░░░░██║  ║"
echo "║  ██╔═██╗░░░░░░██╔══██║░░░░░██║╚████║░░░░░██╔══╝░░░░░░░██╔═██╗░░░░░░██║  ║"
echo "║  ██║░╚██╗░░░░░██║░░██║░░░░░██║░╚███║░░░░░███████╗░░░░░██║░╚██╗░░░░░██║  ║"
echo "║  ╚═╝░░╚═╝░░░░░╚═╝░░╚═╝░░░░░╚═╝░░╚══╝░░░░░╚══════╝░░░░░╚═╝░░╚═╝░░░░░╚═╝  ║"
echo "║                                              ║"
echo "║              ✦ KANEKIBOT–AI ✦               ║"
echo "║              MODE:     Shadow.xyz            ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${RESET}"

sleep 0.7

# ANIMACIÓN PROFESIONAL (mínima, elegante)
echo -e "${C3}Iniciando módulo gráfico..."
sleep 0.3
echo -e "Cargando interfaz...\n${RESET}"
sleep 0.5

# MENÚ
menu() {
  echo -e "${C2}¿Qué deseas hacer?${RESET}"
  echo -e "${C1}1)${RESET} Instalar KanekiBot-AI"
  echo -e "${C1}5)${RESET} Salir\n"
}

# Barra de progreso premium
progreso() {
  steps=36
  bar=""
  for i in $(seq 1 $steps); do
    bar="${bar}▰"
    echo -ne "${C1}Procesando: ${C2}[$bar]${RESET}\r"
    sleep 0.06
  done
  echo ""
}

# FUNCIÓN DE INSTALACIÓN
instalar() {
  clear
  echo -e "${C2}⏳ Preparando entorno premium...${RESET}"
  apt update -y && apt upgrade -y
  pkg install -y git nodejs yarn ffmpeg imagemagick

  echo -e "\n${C1}📥 Descargando KanekiBot-AI...${RESET}"
  progreso

  git clone https://github.com/Shadow-nex/KanekiBot-V3

  cd KanekiBot-V3 || exit
  echo -e "${C2}📦 Instalando dependencias...${RESET}"
  yarn install || npm install

  echo -e "${C1}🚀 Iniciando KanekiBot-AI en modo Pro...${RESET}"
  npm start
}

# CICLO MENÚ
while true; do
  menu
  read -p "👉 Elige una opción: " op
  case $op in
    1) instalar ;;
    5) 
       echo -e "${R}Saliendo del instalador premium...${RESET}"
       exit 
       ;;
    *) echo -e "${R}❌ Opción no válida${RESET}";;
  esac
done
#!/data/data/com.termux/files/usr/bin/bash

# COLORES
R='\e[31m'
G='\e[32m'
Y='\e[33m'
B='\e[34m'
M='\e[35m'
C='\e[36m'
W='\e[37m'
RESET='\e[0m'

clear

# BANNER
echo -e "${C}"
echo "██████╗  █████╗ ███╗   ██╗███████╗██╗  ██╗██╗██████╗  ██████╗ ████████╗"
echo "██╔══██╗██╔══██╗████╗  ██║██╔════╝██║ ██╔╝██║██╔══██╗██╔═══██╗╚══██╔══╝"
echo "██║  ██║███████║██╔██╗ ██║█████╗  █████╔╝ ██║██████╔╝██║   ██║   ██║   "
echo "██║  ██║██╔══██║██║╚██╗██║██╔══╝  ██╔═██╗ ██║██╔══██╗██║   ██║   ██║   "
echo "██████╔╝██║  ██║██║ ╚████║███████╗██║  ██╗██║██║  ██║╚██████╔╝   ██║   "
echo "╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝    ╚═╝   "
echo -e "${RESET}"
sleep 1

echo -e "${G}⭐ Instalador automático de KanekiBot-V3 ⭐${RESET}\n"

# MENÚ
menu() {
  echo -e "${Y}¿Qué deseas hacer?${RESET}"
  echo -e "${C}1)${W} Instalar bot completo"
  echo -e "${C}2)${W} Actualizar bot"
  echo -e "${C}3)${W} Reparar dependencias"
  echo -e "${C}4)${W} Iniciar bot"
  echo -e "${C}5)${W} Salir"
  echo -e ""
}

# FUNCIONES
instalar() {
  clear
  echo -e "${G}⏳ Preparando instalación...${RESET}"
  apt update -y && apt upgrade -y
  pkg install -y git nodejs yarn ffmpeg imagemagick

  echo -e "${C}📥 Clonando KanekiBot-V3...${RESET}"
  git clone https://github.com/Shadow-nex/KanekiBot-V3
  cd KanekiBot-V3 || exit

  echo -e "${Y}📦 Instalando dependencias...${RESET}"
  yarn install || npm install

  echo -e "${G}🚀 Iniciando bot...${RESET}"
  npm start
}

actualizar() {
  clear
  echo -e "${C}🔄 Actualizando bot...${RESET}"
  cd KanekiBot-V3 || exit
  git pull
  yarn install || npm install
  echo -e "${G}✔ Bot actualizado${RESET}"
}

reparar() {
  clear
  echo -e "${Y}🛠 Reparando dependencias...${RESET}"
  yarn cache clean
  npm cache verify
  yarn install || npm install
  echo -e "${G}✔ Reparado${RESET}"
}

iniciar() {
  clear
  echo -e "${G}🚀 Iniciando KanekiBot-V3...${RESET}"
  cd KanekiBot-V3 || exit
  npm start
}

# CICLO DEL MENÚ
while true; do
  menu
  read -p "👉 Elige una opción: " op
  case $op in
    1) instalar ;;
    2) actualizar ;;
    3) reparar ;;
    4) iniciar ;;
    5) echo -e "${R}👋 Saliendo...${RESET}"; exit ;;
    *) echo -e "${R}❌ Opción inválida${RESET}";;
  esac
done
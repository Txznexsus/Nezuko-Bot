import fs from 'fs'
import fetch from 'node-fetch'
import { WAMessageStubType } from '@whiskeysockets/baileys'

const detectarPais = (numero) => {
    const codigos = {
      "1": "🇺🇸 EE.UU / 🇨🇦 Canadá", "7": "🇷🇺 Rusia / 🇰🇿 Kazajistán",
      "20": "🇪🇬 Egipto", "27": "🇿🇦 Sudáfrica", "30": "🇬🇷 Grecia",
      "31": "🇳🇱 Países Bajos", "32": "🇧🇪 Bélgica", "33": "🇫🇷 Francia",
      "34": "🇪🇸 España", "36": "🇭🇺 Hungría", "39": "🇮🇹 Italia",
      "40": "🇷🇴 Rumania", "44": "🇬🇧 Reino Unido", "49": "🇩🇪 Alemania",
      "51": "🇵🇪 Perú", "52": "🇲🇽 México", "53": "🇨🇺 Cuba",
      "54": "🇦🇷 Argentina", "55": "🇧🇷 Brasil", "56": "🇨🇱 Chile",
      "57": "🇨🇴 Colombia", "58": "🇻🇪 Venezuela", "591": "🇧🇴 Bolivia",
      "593": "🇪🇨 Ecuador", "595": "🇵🇾 Paraguay", "598": "🇺🇾 Uruguay",
      "502": "🇬🇹 Guatemala", "503": "🇸🇻 El Salvador",
      "504": "🇭🇳 Honduras", "505": "🇳🇮 Nicaragua",
      "506": "🇨🇷 Costa Rica", "507": "🇵🇦 Panamá",
      "60": "🇲🇾 Malasia", "61": "🇦🇺 Australia", "62": "🇮🇩 Indonesia",
      "63": "🇵🇭 Filipinas", "64": "🇳🇿 Nueva Zelanda",
      "65": "🇸🇬 Singapur", "66": "🇹🇭 Tailandia",
      "81": "🇯🇵 Japón", "82": "🇰🇷 Corea del Sur", "84": "🇻🇳 Vietnam",
      "86": "🇨🇳 China", "90": "🇹🇷 Turquía", "91": "🇮🇳 India",
      "212": "🇲🇦 Marruecos", "213": "🇩🇿 Argelia",
      "216": "🇹🇳 Túnez", "218": "🇱🇾 Libia",
      "234": "🇳🇬 Nigeria", "254": "🇰🇪 Kenia",
      "255": "🇹🇿 Tanzania", "256": "🇺🇬 Uganda",
      "258": "🇲🇿 Mozambique", "260": "🇿🇲 Zambia",
      "263": "🇿🇼 Zimbabue"
    }

for (const code in codigos) {
      if (numero.startsWith(code)) return codigos[code]
    }
    return "Desconocido"

async function generarBienvenida({ conn, userId, groupMetadata, chat }) {
  const username = `@${userId.split('@')[0]}`
  const pp = await conn.profilePictureUrl(userId, 'image').catch(() =>
    'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg'
  )
import fetch from "node-fetch"

const STICKERS = [
  "https://raw.githubusercontent.com/AkiraDevX/uploads/main/uploads/1763740142663_922659.webp",
  "https://raw.githubusercontent.com/AkiraDevX/uploads/main/uploads/1763740140291_693197.webp",
  "https://raw.githubusercontent.com/AkiraDevX/uploads/main/uploads/1763740049256_596333.webp"
]

let stickerMode = false
let lastSent = {} // user -> timestamp

let handler = async (m, { conn, command, args, usedPrefix }) => {

  // ---- MANEJO DEL COMANDO ----
  if (command === "sticker2") {
    const opt = args[0]?.toLowerCase()

    // Mostrar estado
    if (!opt) {
      return m.reply(`
🌿 *Estado del modo stickers:*  
➡️ ${stickerMode ? "🟢 ACTIVADO" : "🔴 DESACTIVADO"}

Usa:
${usedPrefix}sticker2 on  
${usedPrefix}sticker2 off
      `.trim())
    }

    // Activar
    if (opt === "on") {
      if (stickerMode) return m.reply("🟡 *El modo stickers YA está activado.*")
      stickerMode = true
      return m.reply("🟢 *Modo stickers ACTIVADO correctamente.*")
    }

    // Desactivar
    if (opt === "off") {
      if (!stickerMode) return m.reply("🟡 *El modo stickers YA está desactivado.*")
      stickerMode = false
      return m.reply("🔴 *Modo stickers DESACTIVADO correctamente.*")
    }

    return m.reply("Usa: on / off")
  }

  // ---- AUTO STICKER (solo si ON) ----
  if (stickerMode) {
    const now = Date.now()
    const last = lastSent[m.sender] || 0

    // 1 hora = 3600000 ms
    if (now - last >= 3600000) {
      const url = STICKERS[Math.floor(Math.random() * STICKERS.length)]
      const res = await fetch(url)
      const buffer = await res.buffer()

      await conn.sendMessage(
        m.chat,
        { sticker: buffer },
        { quoted: m } // responde al mensaje del usuario
      )

      lastSent[m.sender] = now
    }
  }
}

handler.help = ["sticker2 on/off"]
handler.tags = ["fun"]
handler.command = ["sticker2"]

export default handler
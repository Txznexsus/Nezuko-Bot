import fetch from "node-fetch"

const STICKERS = [
  "https://raw.githubusercontent.com/AkiraDevX/uploads/main/uploads/1763740142663_922659.webp",
  "https://raw.githubusercontent.com/AkiraDevX/uploads/main/uploads/1763740140291_693197.webp",
  "https://raw.githubusercontent.com/AkiraDevX/uploads/main/uploads/1763740049256_596333.webp"
]

let stickerMode = false
let lastSent = {}

let handler = async (m, { conn, command, usedPrefix }) => {

  if (command === "sticker2") {
    const opt = (m.args && m.args[0]) ? m.args[0].toLowerCase() : null
    if (!opt) return m.reply(`Usa:\n${usedPrefix}sticker on\n${usedPrefix}sticker off`)

    if (opt === "on") {
      stickerMode = true
      return m.reply("✨ *Modo stickers activado.*")
    }

    if (opt === "off") {
      stickerMode = false
      return m.reply("❌ *Modo stickers desactivado.*")
    }

    return m.reply("Usa on / off")
  }

  if (stickerMode) {
    const now = Date.now()
    const last = lastSent[m.sender] || 0

    if (now - last >= 3600000) {
      const url = STICKERS[Math.floor(Math.random() * STICKERS.length)]
      const res = await fetch(url)
      const buffer = await res.buffer()

      await conn.sendMessage(
        m.chat,
        { sticker: buffer },
        { quoted: m }
      )

      lastSent[m.sender] = now
    }
  }
}

handler.help = ["sticker2 on/off"]
handler.tags = ["fun"]
handler.command = ["sticker2"]

export default handler
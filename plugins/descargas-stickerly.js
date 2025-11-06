/*import fetch from "node-fetch"
import fs from "fs"
import path from "path"
import { sticker } from "../lib/sticker.js"

const API_STICKERLY = "https://delirius-apiofc.vercel.app/download/stickerly"

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0])
    return m.reply(
      `🍧 Ingresa la URL de un pack de *Stickerly*.\n\n🌱 Ejemplo:\n> ${usedPrefix + command} https://sticker.ly/s/4I2FC0`
    )

  await m.react("🕓")

  try {
    const res = await fetch(`${API_STICKERLY}?url=${encodeURIComponent(args[0])}`)
    if (!res.ok) throw new Error(`❌ Error al conectar con la API (${res.status})`)
    const json = await res.json()

    if (!json.status || !json.data || !json.data.stickers?.length)
      throw new Error("⚠️ No se pudo obtener el pack. Verifica el enlace.")

    const data = json.data

    const info = `
╭━━━〔 🌸 *STICKERLY PACK* 🌸 〕━━⬣
┃ ✨ *Nombre:* ${data.name}
┃ 👤 *Autor:* ${data.author}
┃ 📦 *Stickers:* ${data.total}
┃ 👀 *Vistas:* ${data.viewCount}
┃ 📤 *Exportados:* ${data.exportCount}
┃ 🎭 *Animado:* ${data.isAnimated ? "Sí" : "No"}
┃ 🔗 *Enlace:* ${data.url}
╰━━━━━━━━━━━━━━━━━━⬣
👥 *Usuario:* ${data.username}
👤 *Followers:* ${data.followers}
    `.trim()

    await conn.sendMessage(
      m.chat,
      {
        text: info,
        contextInfo: {
          externalAdReply: {
            title: `${data.name}`,
            body: `🍃 Autor: ${data.author || "Desconocido"} • ${data.total} stickers`,
            thumbnailUrl: data.preview,
            sourceUrl: data.url,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      },
      { quoted: m }
    )

    let success = 0
    let failed = 0

    for (const stick of data.stickers) {
      try {
        const imgRes = await fetch(stick)
        if (!imgRes.ok) throw new Error("No se pudo descargar el sticker")

        const imgBuffer = Buffer.from(await imgRes.arrayBuffer())
        const stickerBuf = await sticker(imgBuffer, false, data.name, data.author)

        await conn.sendMessage(m.chat, { sticker: stickerBuf }, { quoted: m })
        success++
        await new Promise((resolve) => setTimeout(resolve, 600)) // previene flood
      } catch (err) {
        failed++
        console.log("⚠️ Error con un sticker:", err.message)
      }
    }

    await m.react("✅")

    m.reply(`✅ *Descarga completada*\n📦 *Stickers enviados:* ${success}\n❌ *Fallidos:* ${failed}`)

  } catch (e) {
    console.error("❌ Error general:", e)
    m.reply("⚠️ Error al descargar los stickers del pack. Intenta con otro enlace.")
    await m.react("❌")
  }
}

handler.help = ["stickerlydl <url>"]
handler.tags = ["sticker", "download"]
handler.command = ["stickerlydl", "stickerpack", "dls"]

export default handler*/

import fetch from "node-fetch"
import fs from "fs"
import path from "path"
import JSZip from "jszip"
import { sticker } from "../lib/sticker.js"

const API = "https://delirius-apiofc.vercel.app/download/stickerly"

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(
`🍧 Ingresa la URL de un pack de *Stickerly*.

🌱 Ejemplo:
> ${usedPrefix + command} https://sticker.ly/s/4I2FC0`
  )

  const PACK_NAME = "Kaneki Bot V3"
  const AUTHOR = "shadow.xyz 🌿"

  await m.react("🕓")

  try {
    const res = await fetch(`${API}?url=${encodeURIComponent(args[0])}`)
    const json = await res.json()

    if (!json.status || !json.data?.stickers?.length)
      return m.reply("⚠️ No se pudo obtener el pack. Verifica el enlace.")

    const data = json.data
    const stickers = data.stickers

    await m.reply(`📦 *Creando paquete nativo...*\n⏳ Esto puede tardar un poco...`)

    const zip = new JSZip()

    const metadata = {
      "sticker-pack-id": (Math.random() + 1).toString(36).substring(7),
      "sticker-pack-name": PACK_NAME,
      "sticker-pack-publisher": AUTHOR,
      "android-app-store-link": "",
      "ios-app-store-link": "",
      "stickers": []
    }

    let count = 0

    for (const url of stickers) {
      try {
        const img = await fetch(url)
        const buff = Buffer.from(await img.arrayBuffer())
        const webp = await sticker(buff, false, PACK_NAME, AUTHOR)

        const fileName = `sticker_${count + 1}.webp`

        zip.file(fileName, webp)
        metadata.stickers.push({
          "image-file": fileName,
          "emojis": [""]
        })

        count++
        await new Promise(r => setTimeout(r, 350))
      } catch {}
    }

    zip.file("metadata.json", JSON.stringify(metadata, null, 2))

    const packBuffer = await zip.generateAsync({ type: "nodebuffer" })
    const filePath = path.join("/tmp", `${PACK_NAME.replace(/\s+/g, "_")}.wastickers`)

    fs.writeFileSync(filePath, packBuffer)

    await conn.sendMessage(m.chat, {
      document: fs.readFileSync(filePath),
      mimetype: "application/x-wastickers",
      fileName: `${PACK_NAME}.wastickers`,
      caption: `✅ *Paquete listo*\n🎭 *Nombre:* ${PACK_NAME}\n👤 *Autor:* ${AUTHOR}.`
    }, { quoted: m })

    fs.unlinkSync(filePath)
    await m.react("✅")

  } catch (err) {
    console.log(err)
    await m.react("❌")
    await m.reply("⚠️ Error al crear el paquete. Intenta con otro pack.")
  }
}

handler.help = ["stickerlypack <url>"]
handler.tags = ["sticker", "download"]
handler.command = ["stickerlypack", "packwsp", "wstpack"]

export default handler
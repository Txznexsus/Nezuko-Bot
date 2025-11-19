import { ytdlp } from 'yt-dlp-exec'
import fs from 'fs'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`*Ingresa el link del video de Facebook*\n\nEjemplo:\n${usedPrefix + command} https://www.facebook.com/...`)

  let url = args[0]
  let nombre = 'facebook_video.mp4'

  m.reply("⏳ *Descargando video, espera...*\nPuede tardar si el video es largo.")

  try {

    await ytdlp(url, {
      format: "best[height=480]",
      output: nombre
    })

    if (!fs.existsSync(nombre)) throw "No se descargó el video."

    await conn.sendMessage(
      m.chat,
      {
        document: fs.readFileSync(nombre),
        mimetype: "video/mp4",
        fileName: nombre
      },
      { quoted: m }
    )

    fs.unlinkSync(nombre)

  } catch (e) {
    console.error(e)
    m.reply("❌ *Error al descargar el video.*\nPuede que el video sea privado o el link esté mal.")
  }
}

handler.help = ["xd <url>"]
handler.tags = ["downloader"]
handler.command = ["xd"]

export default handler
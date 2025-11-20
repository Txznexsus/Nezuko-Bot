import fetch from 'node-fetch'
import yts from 'yt-search'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text?.trim())
      return m.reply(`🪴 *Ingresa un enlace válido de TikTok*\nEjemplo:\n${usedPrefix + command} https://vm.tiktok.com/xxxx`)

    await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } })

    const api = await fetch(`https://eliasar-yt-api.vercel.app/api/search/tiktok?query=${encodeURIComponent(text)}`)
    if (!api.ok) throw `❗ Error al conectar con la API`

    const data = await api.json()

    if (!data?.results?.audio)
      return m.reply(`⚠️ No pude obtener el audio del enlace.\nIntenta con otro URL.`)

    let msg = {
      audio: { url: data.results.audio },
      mimetype: 'audio/mp4',
      fileName: `tiktok_${Date.now()}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: data.results.title || "Audio TikTok",
         // mediaUrl: text,
          sourceUrl: text,
          mediaType: 2,
          showAdAttribution: true,
          thumbnail: await (await conn.getFile(data.results.thumbnail)).data
        }
      }
    }

    await conn.sendMessage(m.chat, msg, { quoted: m })
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })

  } catch (e) {
    console.error(e)
    m.reply(`❌ *Ocurrió un error.*\nIntenta nuevamente en unos minutos.`)
    await conn.sendMessage(m.chat, { react: { text: "⚠️", key: m.key } })
  }
}

handler.help = ['tiktokmp3 *<url>*']
handler.tags = ['dl']
handler.command = ['tiktokmp3','ttmp3']
handler.group = true
handler.register = true

export default handler
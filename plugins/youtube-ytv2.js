import fetch from 'node-fetch'
import yts from 'yt-search'
import Jimp from 'jimp'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🌷 *Ingresa un título o enlace de YouTube.*\n\n📌 Ejemplo:\n${usedPrefix + command} LISA - Born Again`)

  try {
    let url = ''
    let videoData = null
    if (/^https?:\/\/(www\.)?youtu/.test(text)) {
      url = text.trim()
      const search = await yts({ videoId: url.split("v=")[1] || url.split("/").pop() })
      videoData = search.videos[0]
    } else {
      const search = await yts(text)
      if (!search?.videos?.length) return m.reply('❌ No encontré resultados.')
      videoData = search.videos[0]
      url = videoData.url
    }

    const caption = `
╭━━━〔 🎞️ *YOUTUBE DOWNLOADER* 〕━━⬣
┃ ✦ *Título:* ${videoData.title}
┃ ✦ *Canal:* ${videoData.author.name}
┃ ✦ *Duración:* ${videoData.timestamp}
┃ ✦ *Vistas:* ${videoData.views.toLocaleString()}
┃ ✦ *Publicado:* ${videoData.ago}
┃ ✦ *Link:* ${videoData.url}
╰━━━━━━━━━━━━━━━━━━⬣

🎋 *Elige la calidad que deseas descargar:*
1️⃣ 144p
2️⃣ 240p
3️⃣ 360p
4️⃣ 480p
5️⃣ 720p
6️⃣ 1080p

_Responde a este mensaje con el número correspondiente._
`.trim()

    const thumb = await (await fetch(videoData.thumbnail)).arrayBuffer()
    const msg = await conn.sendMessage(
      m.chat,
      { image: Buffer.from(thumb), caption },
      { quoted: m }
    )

    conn.ytdl = conn.ytdl || {}
    conn.ytdl[m.sender] = {
      url,
      title: videoData.title,
      thumb: videoData.thumbnail,
      key: msg.key,
      timeout: setTimeout(() => delete conn.ytdl[m.sender], 5 * 60 * 1000)
    }

  } catch (err) {
    console.error(err)
    m.reply('⚠️ Error al procesar la solicitud.')
  }
}

handler.before = async (m, { conn }) => {
  conn.ytdl = conn.ytdl || {}
  const ses = conn.ytdl[m.sender]
  if (!ses || !m.quoted || m.quoted.id !== ses.key.id) return

  const num = parseInt(m.text.trim())
  const qualities = ['144p', '240p', '360p', '480p', '720p', '1080p']
  const quality = qualities[num - 1]

  if (!quality) return m.reply('❌ Opción no válida. Escribe un número del 1 al 6.')

  await m.reply(`📥 *Descargando ${ses.title} en ${quality}...*`)
  m.react('⌛')

  try {
    const api = `https://apis-starlights-team.koyeb.app/starlight/youtube-mp4?url=${encodeURIComponent(ses.url)}&format=${quality}`
    const res = await fetch(api)
    const json = await res.json()
    if (!json.dl_url) throw new Error('No se pudo obtener el enlace de descarga.')

    let thumb = null
    try {
      const img = await Jimp.read(ses.thumb)
      img.resize(300, Jimp.AUTO).quality(70)
      const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)
      img.print(font, 8, img.bitmap.height - 28, `${quality}`)
      thumb = await img.getBufferAsync(Jimp.MIME_JPEG)
    } catch (e) {
      console.log('Error procesando miniatura:', e.message)
    }

    await conn.sendMessage(
      m.chat,
      {
        document: { url: json.dl_url },
        mimetype: 'video/mp4',
        fileName: `${ses.title} [${quality}].mp4`,
        caption: `🎞️ *Título:* ${ses.title}\n✨ *Calidad:* ${quality}`,
        ...(thumb ? { jpegThumbnail: thumb } : {})
      },
      { quoted: m }
    )

    m.react('✅')
    clearTimeout(ses.timeout)
    delete conn.ytdl[m.sender]
  } catch (err) {
    console.error('Error descarga:', err)
    m.reply('⚠️ Ocurrió un error descargando el video.')
  }
}

handler.command = ['ytv-v2', 'ytvpro']
handler.help = ['ytv-v2 <título o URL>']
handler.tags = ['download']

export default handler
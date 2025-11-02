import fetch from 'node-fetch'
import Jimp from 'jimp'
import filesize from 'filesize'
import savetube from '../lib/ytdl.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let q = args.join(' ')
  if (!q) return m.reply(`🍃 *Ingresa el nombre o link del video.*`)

  await m.react('⏰')

  try {
    let url = q
    let videoInfo = null

    if (!q.includes('youtube.com') && !q.includes('youtu.be')) {
      const res = await fetch(`https://delirius-apiofc.vercel.app/search/ytsearch?q=${encodeURIComponent(q)}`)
      const json = await res.json()
      if (!json.status || !json.data.length) throw new Error('Sin resultados.')
      videoInfo = json.data[0]
      url = videoInfo.url
    }

    const data = await savetube.download(url, 'audio', '128')
    if (!data.status) throw new Error(data.error || 'Error al descargar audio.')

    const { title, thumbnail, duration, url: dl, size } = data
    const bytes = size ? filesize(size) : 'Desconocido'

    let jpegThumbnail = null
    try {
      const thumb = await fetch(thumbnail)
      const thumbBuf = Buffer.from(await thumb.arrayBuffer())
      const img = await Jimp.read(thumbBuf)
      img.resize(200, 200)
      jpegThumbnail = await img.getBufferAsync(Jimp.MIME_JPEG)
    } catch {
      jpegThumbnail = null
    }

    const info = `> 🌿 *Título:* ${title}
> 🍓 *Canal:* ${videoInfo?.channel || data.author || 'Desconocido'}
> 🌾 *Duración:* ${duration}
> 🌱 *Tamaño:* ${bytes}
> 💮 *Vistas:* ${videoInfo?.views || 'No disponible'}
> 🍃 *Publicado:* ${videoInfo?.published || 'Desconocido'}
> 🍂 *Calidad:* 128kbps
> ✨ *Enlace:* ${url}`

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: info
    }, { quoted: m })
    
    try {
      const res = await fetch(dl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buffer = Buffer.from(await res.arrayBuffer())

      await conn.sendMessage(m.chat, {
        document: buffer,
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        jpegThumbnail,
        contextInfo: {
          externalAdReply: {
            mediaType: 1,
            thumbnailUrl: thumbnail,
            sourceUrl: url,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m })

    } catch (err) {
      console.warn('⚠️ No se pudo descargar el mp3 a buffer:', err.message)
      await conn.sendMessage(m.chat, {
        document: { url: dl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        jpegThumbnail
      }, { quoted: m })
    }

    await m.react('✅')

  } catch (e) {
    console.error(e)
    m.reply(`💔 *Error:* ${e.message}`)
    await m.react('❌')
  }
}

handler.help = ['ytdl']
handler.tags = ['download']
handler.command = ['ytdl']

export default handler
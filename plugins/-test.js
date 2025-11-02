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
    if (!data.status) throw new Error(data.error)

    const { title, thumbnail, duration, url: dl, size } = data
    const bytes = size ? filesize(size) : 'Desconocido'

    const thumbBuffer = await (await fetch(thumbnail)).arrayBuffer()
    const img = await Jimp.read(Buffer.from(thumbBuffer))
    img.resize(200, 200)
    const jpegThumbnail = await img.getBufferAsync(Jimp.MIME_JPEG)

    const info = `> 🌿 *Título:* ${title}
> 🍓 *Canal:* ${videoInfo?.channel || 'Desconocido'}
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

    await conn.sendMessage(m.chat, {
      document: { url: dl },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      jpegThumbnail: jpegThumbnail,
      contextInfo: {
        externalAdReply: {
          mediaType: 1,
          thumbnailUrl: thumbnail,
          sourceUrl: url,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: fkontak })

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
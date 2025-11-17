import axios from 'axios'
import Jimp from 'jimp'

const handler = async (m, { conn, text, usedPrefix }) => {
  if (!text) return conn.reply(m.chat, '🍃 Por favor, ingresa un término de búsqueda o el enlace de TikTok.', m, rcanal)

  const isUrl = /(?:https:?\/{2})?(?:www\.|vm\.|vt\.|t\.)?tiktok\.com\/([^\s&]+)/gi.test(text)

  try {
    await m.react('🕒')
    if (isUrl) {

      const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}?hd=1`)
      const data = res.data?.data;

      if (!data?.play) 
        return conn.reply(m.chat, 'ꕥ Enlace inválido o sin contenido descargable.', m)

      const { 
        title, duration, author, created_at, type, images, music, play,
        digg_count, download_count, comment_count, share_count, collect_count
      } = data

      let thumb = null
      try {
        const img = await Jimp.read(data.cover || data.origin_cover || data.dynamic_cover)
        img.resize(500, Jimp.AUTO)
        thumb = await img.getBufferAsync(Jimp.MIME_JPEG)
      } catch (err) {
        console.log("Error al procesar miniatura:", err)
      }

      const caption = `
🍃 *Título:* \`${title || 'No disponible'}\`
✨ *Autor:* ${author?.nickname || author?.unique_id}
🍟 *Duración:* ${duration}s
🕒 *Fecha:* ${created_at}

📊 *Estadísticas:*
❤️ Likes: ${digg_count}
⬇️ Descargas: ${download_count}
💬 Comentarios: ${comment_count}
🔄 Compartidos: ${share_count}
📌 Guardados: ${collect_count}
`

      if (type === 'image' && Array.isArray(images)) {

        const medias = images.map(url => ({
          type: 'image',
          data: { url },
          caption,
          ...(thumb ? { jpegThumbnail: thumb } : {})
        }))

        await conn.sendSylphy(m.chat, medias, { quoted: m })

        if (music) {
          await conn.sendMessage(m.chat, {
            document: { url: music },
            mimetype: 'audio/mp4',
            fileName: 'tiktok_audio.mp3'
          }, { quoted: m })
        }

      } else {

 
        await conn.sendMessage(m.chat, {
          video: { url: play },
          caption,
        }, { quoted: m })

 
        if (music) {
          await conn.sendMessage(m.chat, {
            document: { url: music },
            ...(thumb ? { jpegThumbnail: thumb } : {})
            mimetype: 'audio/mp4',
            fileName: 'tiktok_audio.mp3'
          }, { quoted: m })
        }
      }

    } 
    
    else {

      const res = await axios({
        method: 'POST',
        url: 'https://tikwm.com/api/feed/search',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Cookie': 'current_language=en',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
        },
        data: { keywords: text, count: 20, cursor: 0, HD: 1 }
      })

      const results = res.data?.data?.videos?.filter(v => v.play) || []

      if (results.length < 2) 
        return conn.reply(m.chat, 'ꕥ Se requieren al menos 2 resultados válidos con contenido.', m)

      const medias = results.slice(0, 10).map(v => ({
        type: 'video',
        data: { url: v.play },
        caption: createSearchCaption(v)
      }))

      await conn.sendSylphy(m.chat, medias, { quoted: m })
    }

    await m.react('✔️')

  } catch (e) {
    await m.react('✖️')
    return conn.reply(
      m.chat, 
      `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}`, 
      m
    )
  }
}

function createSearchCaption(data) {
  return `🍃 Título › ${data.title || 'No disponible'}

✨ Autor › ${data.author?.nickname || 'Desconocido'} ${data.author?.unique_id ? `@${data.author.unique_id}` : ''}
🍟 Duración › ${data.duration || 'No disponible'}
🍓 Música › ${data.music?.title || `[${data.author?.nickname || 'No disponible'}] original sound - ${data.author?.unique_id || 'unknown'}`}`
}

handler.help = ['tiktok', 'tt']
handler.tags = ['download', 'search']
handler.command = ['tiktok', 'tt', 'tiktoks', 'tts']
handler.group = true

export default handler
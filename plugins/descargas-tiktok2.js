import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    let regex = /https?:\/\/(?:www\.|vm\.|vt\.)?tiktok\.com\/[^\s]+/i
    let match = m.text.match(regex)
    if (!match) return

    let url = match[0]
    await m.react('⏳')

    let api = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}?hd=1`
    let res = await fetch(api)
    let json = await res.json()

    if (!json || json.code !== 0 || !json.data) {
      await m.react('❌')
      return conn.reply(m.chat, 'No se pudo obtener el video, intenta nuevamente.', m)
    }

    const data = json.data
    const {
      id, region, title, cover, origin_cover, duration,
      play, wmplay, music, music_info, play_count, digg_count,
      comment_count, share_count, download_count, author, images, create_time
    } = data

    const info = `> 🪺 *Título:* ${title || 'Sin título'}
> 👤 *Autor:* ${author?.nickname || '-'} (@${author?.unique_id || '-'})
> 🆔 *ID:* ${id || '-'}
> 🌎 *Región:* ${region || '-'}
> ⏱️ *Duración:* ${duration || 0}s
> 🎵 *Música:* ${music_info?.title || 'Original'}
> ❤️ *Likes:* ${digg_count || 0}
> 💬 *Comentarios:* ${comment_count || 0}
> 🔄 *Compartidos:* ${share_count || 0}
> 📥 *Descargas:* ${download_count || 0}
> 🗓️ *Publicado:* ${new Date(create_time * 1000).toLocaleString()}`.trim()

    // Si tiene varias imágenes (slideshow)
    if (images && images.length > 0) {
      await m.react('🖼️')
      for (let i = 0; i < images.length; i++) {
        await conn.sendMessage(
          m.chat,
          {
            image: { url: images[i] },
            caption: i === 0 ? info : `📷 Imagen ${i + 1}/${images.length} 🌿`
          },
          { quoted: m }
        )
      }
    } else {
      await m.react('📥')
      await conn.sendMessage(
        m.chat,
        {
          video: { url: play },
          caption: info,
          gifPlayback: false,
          jpegThumbnail: Buffer.from(await (await fetch(cover)).arrayBuffer())
        },
        { quoted: m }
      )
    }

    await m.react('✔️')

  } catch (err) {
    console.error(err)
    await m.react('❌')
    conn.reply(m.chat, '❌ Ocurrió un error al procesar el video de TikTok.', m)
  }
}

handler.customPrefix = /https?:\/\/(?:www\.|vm\.|vt\.)?tiktok\.com\/[^\s]+/i
handler.command = new RegExp
handler.limit = true
export default handler
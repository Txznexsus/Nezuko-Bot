import fetch from 'node-fetch'
import yts from 'yt-search'
import Jimp from 'jimp'

/**
 * Handler mejorado:
 * - Usa API: https://apis-starlights-team.koyeb.app/starlight/youtube-mp4
 * - Los botones usan URL en Base64 para que no rompan por querystrings
 * - Genera jpegThumbnail con Jimp (300px)
 */

let handler = async (m, { conn, text = "", args = [], usedPrefix, command }) => {
  if (!text) return m.reply(`*✎ Ingresa un título o link de YouTube*`)

  try {
    // Normalizar args por si vienen vacíos
    args = (text || "").trim().split(/\s+/).filter(Boolean)

    let url = ''
    let title = ''

    // Si primer arg parece Base64 (botón) y trae calidad en args[1]
    const maybeBase64 = args[0] && /^[A-Za-z0-9+/=]+$/.test(args[0])
    if (maybeBase64 && args[1] && /\d{3}p?/.test(args[1])) {
      try {
        url = Buffer.from(args[0], 'base64').toString('utf8')
      } catch (e) {
        url = ''
      }
      // title no necesario aquí
    } else if (args[0] && /^https?:\/\/(www\.)?youtu/.test(args[0])) {
      // Si el usuario puso url directo
      url = args[0]
      title = text.replace(args[0], "").trim()
    } else {
      // Búsqueda por texto
      const searchRes = await yts(text)
      if (!searchRes?.videos?.length) return m.reply('❌ No encontré resultados.')
      const vid = searchRes.videos[0]
      url = vid.url
      title = vid.title
    }

    // Si el usuario incluyó una calidad como segundo arg (ej: "360" o "360p")
    const qualityArg = args[1] ? String(args[1]).replace(/p/i, "") : null

    // Si hay calidad pedida -> hacemos la descarga por la API nueva
    if (qualityArg) {
      const q = qualityArg.endsWith('p') ? qualityArg : `${qualityArg}p`
      await m.reply(`*📥 Descargando video en calidad ${q}, espera un momento...*`)

      const api = `https://apis-starlights-team.koyeb.app/starlight/youtube-mp4?url=${encodeURIComponent(url)}&format=${encodeURIComponent(q)}`
      const res = await fetch(api, { timeout: 60_000 })
      if (!res.ok) throw new Error(`API responded ${res.status}`)
      const json = await res.json()

      if (!json || !json.dl_url) throw new Error("La API no devolvió dl_url.")

      const result = {
        title: json.title || title || 'video',
        thumbnail: json.thumbnail || (json.thumbnail ? json.thumbnail : null),
        dl_url: json.dl_url,
        quality: json.quality || q
      }

      // Procesar miniatura con Jimp (300px ancho)
      let thumb = null
      try {
        if (result.thumbnail) {
          const img = await Jimp.read(result.thumbnail)
          img.resize(300, Jimp.AUTO).quality(70)
          // opcional: agregar texto pequeño con calidad
          const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)
          img.print(font, 8, img.bitmap.height - 28, `${result.quality}`) // esquina inferior izquierda
          thumb = await img.getBufferAsync(Jimp.MIME_JPEG)
        }
      } catch (err) {
        console.log("Error al procesar miniatura:", err?.message || err)
        thumb = null
      }

      // Enviar como documento con jpegThumbnail para que NO se vea solo gris sin preview
      return await conn.sendMessage(m.chat, {
        document: { url: result.dl_url },
        mimetype: 'video/mp4',
        fileName: `${result.title || 'video'}.mp4`,
        caption: `\`\`\`💐 Título: ${result.title}\n✨ Calidad: ${result.quality}\`\`\``,
        ...(thumb ? { jpegThumbnail: thumb } : {})
      }, { quoted: m })
    }

    // Si no pidió calidad: mostrar info y botones
    await m.reply('*🌱 Buscando información del video...*')

    const searchInfo = await yts(url)
    const video = searchInfo.videos[0]
    if (!video) return m.reply('No se encontró info del video.')

    const likes = video.likes ? video.likes.toLocaleString() : 'N/A'
    const desc = video.description ? (video.description.slice(0, 200) + "...") : 'Sin descripción'

    const caption = `*✨ Información del video:*\n\n` +
      `\`\`\`✦ Título: ${video.title}\n` +
      `✦ Duración: ${video.timestamp}\n` +
      `✦ Vistas: ${video.views.toLocaleString()}\n` +
      `✦ Likes: ${likes}\n` +
      `✦ Subido: ${video.ago}\n` +
      `✦ Canal: ${video.author.name}\n` +
      `✦ Link: ${video.url}\`\`\`\n\n` +
      `*📝 Descripción:* ${desc}`

    // Botones que envían comandos seguros: codificamos la URL en Base64 para evitar romper
    const b64url = Buffer.from(video.url).toString('base64') // button payload safe
    const buttons = [
      { buttonId: `${usedPrefix + command} ${b64url} 360`, buttonText: { displayText: "📹 360p" }, type: 1 },
      { buttonId: `${usedPrefix + command} ${b64url} 480`, buttonText: { displayText: "🎥 480p" }, type: 1 },
      { buttonId: `${usedPrefix + command} ${b64url} 720`, buttonText: { displayText: "📺 720p" }, type: 1 }
    ]

    await conn.sendMessage(m.chat, {
      image: { url: video.thumbnail },
      caption,
      footer: "Elige la calidad con los botones o escribe el comando con calidad",
      buttons,
      headerType: 4
    }, { quoted: m })

  } catch (e) {
    console.error("Error en ytv-v2:", e)
    m.reply('⚠️ Error al procesar la solicitud: ' + (e.message || e))
  }
}

handler.help = ['ytv-v2 <url|título> [calidad]']
handler.tags = ['download']
handler.command = ['ytv-v2']

export default handler
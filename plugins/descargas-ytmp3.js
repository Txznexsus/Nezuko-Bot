import fetch from 'node-fetch'
import yts from 'yt-search'
import axios from 'axios'

let handler = async (m, { conn, text, command, usedPrefix }) => {
  try {
    if (!text) {
      return conn.reply(
        m.chat,
        `🌴 Ingresa el nombre de la canción o un enlace de YouTube.\n\n> Ejemplo: ${usedPrefix + command} DJ Malam Pagi`,
        m, fake
      )
    }

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })
    await conn.reply(m.chat, '*_🪵 Buscando en Youtube_*', m)

    const search = await yts(text)
    const video = search.videos[0]
    if (!video) return conn.reply(m.chat, '☁️ No se encontró ningún resultado.', m)

    const meta = {
      title: video.title,
      duration: video.timestamp,
      url: video.url,
      author: video.author?.name || "Desconocido",
      views: video.views?.toLocaleString('es-PE') || "0",
      ago: video.ago || "Desconocido",
      thumbnail: video.thumbnail
    }

    const apis = [
      {
        api: 'Vreden',
        endpoint: `https://api.vreden.my.id/api/v1/download/youtube/audio?url=${encodeURIComponent(meta.url)}&quality=128`,
        extractor: res => res.result?.download?.url
      },
      {
        api: 'ZenzzXD v2',
        endpoint: `https://api.zenzxz.my.id/api/downloader/ytmp3v2?url=${encodeURIComponent(meta.url)}`,
        extractor: res => res.data?.download_url
      }
    ]

    const { url: downloadUrl, servidor } = await fetchFromApis(apis)
    if (!downloadUrl) return conn.reply(m.chat, 'Ninguna API devolvió el audio.', m)

    const size = await getSize(downloadUrl)
    const sizeStr = size ? formatSize(size) : 'Desconocido'

    const textoInfo = `🍃 *Título:* 
> ${meta.title}
🍁 *Duración:* 
> ${meta.duration}
🍀 *Tamaño:* 
> ${sizeStr}
🌾 *Calidad:* 
> 128kbps
🪸 *Canal:* 
> ${meta.author}
🌿 *Vistas:*
> ${meta.views}
🌳 *Publicado:* 
> ${meta.ago}
🌷 *Enlace:*
> ${meta.url}
🎋 *Servidor usado:* 
> ${servidor}
────────────────────
🦋 *Procesando tu canción...*`

    const thumb = (await conn.getFile(meta.thumbnail)).data
    await conn.sendMessage(m.chat, { image: thumb, caption: textoInfo, ...fake }, { quoted: m })

    const audioResponse = await axios.get(downloadUrl, { responseType: 'arraybuffer' })
    const audioBuffer = Buffer.from(audioResponse.data)

    await conn.sendMessage(m.chat, {
      audio: audioBuffer,
      fileName: `${meta.title}.mp3`,
      mimetype: "audio/mpeg",
      ptt: false, // true pa nota de voz xD
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          title: '🧃 𝒀  𝑶 𝑼 𝑻 𝑼 𝑩 𝑬 • 𝑴 𝑼 𝑺 𝑰 𝑪 🦋',
          body: `Duración: ${meta.duration} | Tamaño: ${sizeStr} | Servidor: ${servidor}`,
          thumbnailUrl: meta.thumbnail,
          mediaType: 2,
          renderLargerThumbnail: true,
          mediaUrl: meta.url,
          sourceUrl: meta.url
        }
      }
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: "✔️", key: m.key } })

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, `Error: ${e.message}`, m)
  }
}

handler.command = ['ytmp3', 'song']
handler.tags = ['download']
handler.help = ['ytmp3 <texto o link>', 'song <texto>']
handler.group = true

export default handler


async function fetchFromApis(apis) {
  for (const api of apis) {
    try {
      const res = await axios.get(api.endpoint, { timeout: 10000 })
      const url = api.extractor(res.data)
      if (url) return { url, servidor: api.api }
    } catch (e) { continue }
  }
  return { url: null, servidor: "Ninguno" }
}

async function getSize(url) {
  try {
    const response = await axios.head(url)
    const length = response.headers['content-length']
    return length ? parseInt(length, 10) : null
  } catch {
    return null
  }
}

function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  if (!bytes || isNaN(bytes)) return 'Desconocido'
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024
    i++
  }
  return `${bytes.toFixed(2)} ${units[i]}`
}
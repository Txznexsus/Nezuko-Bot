import axios from 'axios'

const handler = async (m, { text, conn, args }) => {
  if (!args[0]) return conn.reply(m.chat, '🌿 Por favor, ingresa un enlace de Facebook.', m, fake)

  const fbUrl = args[0]
  let res

  try {
    await m.react('🎇')
    res = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/facebook?url=${fbUrl}`)
  } catch (e) {
    console.error(e)
    await m.react('❌')
    return conn.reply(m.chat, '⚠️ Error al obtener datos. Verifica el enlace o inténtalo más tarde.', m, fake)
  }

  const result = res.data
  if (!result || result.length === 0) {
    return conn.reply(m.chat, 'No se encontraron resultados del video.', m, fake)
  }
  
  const videoDataHD = result.find(video => video.quality?.includes('720p'))
  const videoDataSD = result.find(video => video.quality?.includes('360p'))
  const videoUrl = videoDataHD?.link_hd || videoDataSD?.link_sd

  if (!videoUrl) return conn.reply(m.chat, 'No se encontró una resolución disponible.', m, fake)

  const caption = `🍓 *Calidad:* ${videoDataHD ? '720p (HD)' : '360p (SD)'}
🎇 *Formato:* MP4 (documento)`.trim()

  const maxRetries = 3
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await conn.sendMessage(
        m.chat,
        {
          document: { url: videoUrl },
          caption,
          fileName: 'facebook_video.mp4',
          mimetype: 'video/mp4',
        },
        { quoted: m }
      )
      await m.react('✅')
      break
    } catch (e) {
      console.error(`Intento ${attempt} fallido:`, e)
      if (attempt === maxRetries) {
        return conn.reply(m.chat, 'Error al enviar el video después de varios intentos.', m, fake)
      }
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
  }
}

handler.help = ['fb2']
handler.tags = ['descargas']
handler.command = ['fb2']
handler.register = true

export default handler
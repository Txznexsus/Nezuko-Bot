import fetch from 'node-fetch'
import Jimp from 'jimp'
import baileys from '@whiskeysockets/baileys'
const { proto, generateWAMessageFromContent } = baileys

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text)
    return m.reply(
      `🍂 *Uso correcto:*\n\n✦ \`${usedPrefix + command}\` <url o nombre de canción>\n\n🍬 Ejemplo:\n${usedPrefix + command} https://open.spotify.com/track/2ROQe6QkIXODJRx0y8UjzV`
    )

  await conn.sendMessage(m.chat, { react: { text: '🕓', key: m.key } })

  try {
    let spotifyUrl = text.includes('spotify.com/track')
      ? text
      : null

    // 🔍 Si el usuario puso nombre, buscamos el primer resultado
    if (!spotifyUrl) {
      const searchUrl = `https://api.yupra.my.id/api/search/spotify?q=${encodeURIComponent(text)}`
      const searchRes = await fetch(searchUrl)
      if (!searchRes.ok) throw 'Error en la búsqueda de Yupra.'
      const searchData = await searchRes.json()
      const first = searchData.result?.[0]
      if (!first) throw '❌ No se encontraron resultados en Spotify.'
      spotifyUrl = first.spotify_preview || first.url
    }

    // 🎧 Descargar audio desde la API de Stellar
    const apiUrl = `https://api.stellarwa.xyz/dl/spotifyv2?url=${encodeURIComponent(spotifyUrl)}&key=stellar-3j2706f1`
    const res = await fetch(apiUrl)
    if (!res.ok) throw 'Error al conectar con la API de Stellar.'
    const data = await res.json()
    if (!data.status || !data.data?.dl) throw '❌ No pude obtener la descarga del audio.'

    const d = data.data
    const song = {
      title: d.title || 'Desconocido',
      artist: d.artist || 'Desconocido',
      album: d.album || 'N/A',
      release: d.release_date || 'N/A',
      duration: d.duration || 'N/A',
      image: d.image,
      card: d.card,
      download: d.dl,
      spotify: spotifyUrl
    }

    // 🖼️ Miniatura optimizada
    let thumb = null
    try {
      const img = await Jimp.read(song.image)
      img.resize(300, Jimp.AUTO)
      thumb = await img.getBufferAsync(Jimp.MIME_JPEG)
    } catch (err) {
      console.log('⚠️ Error al procesar miniatura:', err)
    }

    // 📄 Descripción del mensaje
    const caption = `
\`\`\`🎧 Título: ${song.title}
👤 Artista: ${song.artist}
💽 Álbum: ${song.album}
📆 Lanzamiento: ${song.release}
⏱️ Duración: ${song.duration}
🔗 Spotify: ${song.spotify}\`\`\`
`

    // 🎀 Mensaje interactivo con botón y preview
    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: { deviceListMetadataVersion: 2 },
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.create({
                text: caption,
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: '🌿 ᴋᴀɴᴇᴋɪ ʙᴏᴛ ᴠ3 - sᴘᴏᴛɪғʏ ᴍᴜsɪᴄ 🎧',
              }),
              header: proto.Message.InteractiveMessage.Header.create({
                hasMediaAttachment: true,
                ...(thumb
                  ? { jpegThumbnail: thumb }
                  : {}),
              }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                buttons: [
                  {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                      display_text: '🎵 ᴇsᴄᴜᴄʜᴀʀ ᴇɴ sᴘᴏᴛɪғʏ',
                      url: song.spotify,
                    }),
                  },
                ],
              }),
            }),
          },
        },
      },
      { quoted: m }
    )

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

    // 🎧 Enviar el audio final
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: song.download },
        mimetype: 'audio/mpeg',
        fileName: `${song.title}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: song.title,
            body: song.artist,
            thumbnailUrl: song.card || song.image,
            mediaType: 2,
            renderLargerThumbnail: true,
            sourceUrl: song.spotify,
          },
        },
      },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply(`❌ *Error al procesar la descarga de Spotify.*\n\n${e}`)
  }
}

handler.help = ['music <url|nombre>']
handler.tags = ['download']
handler.command = ['music', 'spotifydl']

export default handler
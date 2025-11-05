import fetch from 'node-fetch'
import Jimp from 'jimp'
import baileys from '@whiskeysockets/baileys'
const { proto } = baileys

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text)
    return m.reply(
      `🍂 *Uso correcto:*\n\n✦ \`${usedPrefix + command}\` <url o nombre de canción>\n\n🍬 Ejemplo:\n${usedPrefix + command} https://open.spotify.com/track/2ROQe6QkIXODJRx0y8UjzV`
    )

  await conn.sendMessage(m.chat, { react: { text: '🕓', key: m.key } })

  try {
    let spotifyUrl = text.includes('spotify.com/track') ? text : null

    if (!spotifyUrl) {
      const search = await fetch(`https://api.yupra.my.id/api/search/spotify?q=${encodeURIComponent(text)}`)
      if (!search.ok) throw 'Error al buscar en Yupra.'
      const sdata = await search.json()
      const first = sdata.result?.[0]
      if (!first) throw '❌ No se encontraron resultados en Spotify.'
      spotifyUrl = first.spotify_preview || first.url
    }

    const res = await fetch(`https://api.stellarwa.xyz/dl/spotifyv2?url=${encodeURIComponent(spotifyUrl)}&key=stellar-3j2706f1`)
    if (!res.ok) throw 'Error al conectar con la API de Stellar.'
    const data = await res.json()
    if (!data.status || !data.data?.dl) throw '❌ No pude obtener la descarga del audio.'

    const d = data.data
    const song = {
      title: d.title,
      artist: d.artist,
      album: d.album,
      release: d.release_date,
      duration: d.duration,
      image: d.image,
      card: d.card,
      download: d.dl,
      spotify: spotifyUrl,
    }

    let thumb = null
    try {
      const img = await Jimp.read(song.image)
      img.resize(300, Jimp.AUTO)
      thumb = await img.getBufferAsync(Jimp.MIME_JPEG)
    } catch {}

    const caption = `
🎧 *${song.title}*
👤 *${song.artist}*
💽 ${song.album}
📆 ${song.release}
⏱️ ${song.duration}
🔗 [Spotify](${song.spotify})
`

    await conn.sendMessage(
      m.chat,
      {
        document: { url: song.download },
        mimetype: 'audio/mpeg',
        fileName: `${song.title}.mp3`,
        caption,
        contextInfo: {
          externalAdReply: {
            title: song.title,
            body: song.artist,
            thumbnailUrl: song.card || song.image,
            mediaType: 2,
            renderLargerThumbnail: true,
            sourceUrl: song.spotify,
          },

          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          businessMessageForwardInfo: {},
          messageAd: true,
          externalReply: true,
          buttonParamsJson: JSON.stringify({
            display_text: '🎵 ᴇsᴄᴜᴄʜᴀʀ ᴇɴ sᴘᴏᴛɪғʏ',
            url: song.spotify,
          }),
        },
      },
      { quoted: m }
    )

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
  } catch (err) {
    console.error(err)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply('❌ Error al procesar la descarga de Spotify.')
  }
}

handler.help = ['music <url|nombre>']
handler.tags = ['download']
handler.command = ['music', 'spotifydl']

export default handler
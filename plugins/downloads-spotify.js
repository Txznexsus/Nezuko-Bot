// - By Shadow-xyz
// -51919199620

import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, `🎋 *Por favor, proporciona el nombre de una canción o artista.*`, m, rcanal)

  try {
 
    const searchUrl = `${global.APIs.delirius.url}/search/spotify?q=${encodeURIComponent(text)}&limit=1`
    const search = await axios.get(searchUrl, { timeout: 15000 })

    if (!search.data.status || !search.data.data || search.data.data.length === 0)
      throw new Error('No se encontró resultado.')

    const data = search.data.data[0]
    const { title, artist, album, duration, popularity, publish, url: spotifyUrl, image } = data

    const caption = `「🌳」Descargando *<${title}>*\n\n` +
      `> 🍄 Autor » *${artist}*\n` +
      (album ? `> 🌾 Álbum » *${album}*\n` : '') +
      (duration ? `> 🎍 Duración » *${duration}*\n` : '') +
      (popularity ? `> 🎅 Popularidad » *${popularity}*\n` : '') +
      (publish ? `> 🌿︎ Publicado » *${publish}*\n` : '') +
      (spotifyUrl ? `> ☕ Enlace » ${spotifyUrl}` : '')

    await conn.sendMessage(m.chat, {
      text: caption,
      contextInfo: {
        externalAdReply: {
          title: '🎇 ✧ s⍴᥆𝗍і𝖿ᥡ • mᥙsіᥴ ✧ 🎇',
          body: artist,
          thumbnailUrl: image,
          sourceUrl: spotifyUrl,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    let downloadUrl = null
    let serverUsed = 'Desconocido'

    try {
      const apiNeko = `https://api.nekolabs.my.id/ownloader/spotify/v1?url=${encodeURIComponent(spotifyUrl)}`
      const dl1 = await axios.get(apiNeko, { timeout: 20000 })
      if (dl1?.data?.result?.downloadUrl) {
        downloadUrl = dl1.data.result.downloadUrl
        serverUsed = 'NekoLabs'
      }
    } catch (err) { }

    if (!downloadUrl || downloadUrl.includes('undefined')) {
      try {
        const apiAdo = `${global.APIs.adonix.url}/ownload/spotify?apikey=${global.APIs.adonix.key}&q=${encodeURIComponent(spotifyUrl)}`
        const dl2 = await axios.get(apiAdo, { timeout: 20000 })

        if (dl2?.data?.status === true && dl2?.data?.downloadUrl) {
          downloadUrl = dl2.data.downloadUrl
          serverUsed = 'Adonix'
        }

      } catch (err) { }
    }

    if (downloadUrl) {
      const audio = await fetch(downloadUrl)
      const buffer = await audio.buffer()

      await conn.sendMessage(m.chat, {
        audio: buffer,
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        ptt: false,
        contextInfo: {
          externalAdReply: {
            title: "✎ 𝘿𝙚𝙨𝙘𝙖𝙧𝙜𝙖 𝘾𝙤𝙢𝙥𝙡𝙚𝙩𝙖.",
            body: `✿ 𝙎𝙚𝙧𝙫𝙞𝙙𝙤𝙧: ${serverUsed}`,
            thumbnailUrl: image,
            sourceUrl: spotifyUrl,
            mediaType: 1,
            renderLargerThumbnail: false
          }
        }
      }, { quoted: fkontak })
    } else {
      conn.reply(m.chat, `☕ No se encontró un link de descarga válido para esta canción.`, m, fake)
    }

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `Error al buscar o descargar la canción.`, m, fake)
  }
}

handler.help = ["spotify"]
handler.tags = ["download"]
handler.command = ["spotify", "splay"]
handler.group = true
handler.register = true

export default handler
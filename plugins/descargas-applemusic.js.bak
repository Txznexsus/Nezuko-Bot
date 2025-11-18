import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) return conn.reply(m.chat, `🍎 *Ingresa un nombre de canción*\nEjemplo:\n${usedPrefix + command} Hola`, m)

    let url = `https://api.zenzxz.my.id/api/search/applemusic?keyword=${encodeURIComponent(text)}&country=sg`

    let res = await fetch(url)
    if (!res.ok) throw await res.text()

    let json = await res.json()
    let data = json.data

    if (!data || data.length < 1)
      return conn.reply(m.chat, `⚠️ No se encontraron resultados para *${text}*`, m)

    let song = data[0]

    let caption = `
╭━━━〔 🍎 𝐀𝐏𝐏𝐋𝐄 𝐌𝐔𝐒𝐈𝐂 🍎 〕━━⬣
│🎵 *Título:* ${song.title}
│👤 *Artista:* ${song.artist}
│💽 *Álbum:* ${song.album}
│🕒 *Duración:* ${(song.duration / 1000).toFixed(0)} seg
│🔗 *Link:* ${song.url}
╰━━━━━━━━━━━━━━━━━━━⬣`.trim()

    await conn.sendMessage(m.chat, {
      image: { url: song.artwork },
      caption
    }, { quoted: m })

    if (song.preview) {
      await conn.sendMessage(m.chat, {
        audio: { url: song.preview },
        mimetype: 'audio/mpeg',
        fileName: `${song.title}.mp3`
      }, { quoted: m })
    }

  } catch (e) {
    console.log(e)
    conn.reply(m.chat, '*Ocurrió un error al buscar la canción.*', m)
  }
}

handler.help = ['apple', 'applemusic']
handler.tags = ['search']
handler.command = ['apple', 'applemusic']
handler.group = true
handler.register = true
export default handler
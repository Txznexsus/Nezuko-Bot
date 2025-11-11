import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `*⚡ Usa el comando así:*\n\n> ${usedPrefix + command} Dragon Ball`, m, rcanal)

  await m.react('🕐')

  try {

    let res = await fetch(`https://api.stellarwa.xyz/search/mediafire?query=${encodeURIComponent(text)}&key=stellar-3j2706f1`)
    let json = await res.json()

    if (!json || !json.results || json.results.length === 0) {
      throw `No se encontraron resultados para: *${text}*`
    }

    let txt = `╭━━━━━━━╮
┋ ʀᴇsᴜʟᴛᴀᴅᴏs
┋    ᴅᴇ 🚀
┋ ᴍᴇᴅɪᴀғɪʀᴇ
┋ ʙᴜsǫᴜᴇᴅᴀ: ${text}
╰━━━━━━━╯`

    json.results.forEach((file, i) => {
      txt += `🎋 *${i + 1}.* ${file.filename || 'Archivo desconocido'}\n`
      txt += `⚖️ *Tamaño:* ${file.filesize || 'Desconocido'}\n`
      txt += `🌾 *Link:* ${file.url || 'No disponible'}\n`
      txt += `🍃 *URL Fuente:* ${file.source_url || 'No disponible'}\n`
      txt += `❄️ *Título Fuente:* ${file.source_title || 'Sin título'}\n\n`
    })

    await m.react('✔️')
    await conn.reply(m.chat, txt.trim(), m, rcanal)

  } catch (err) {
    console.error(err)
    await conn.reply(m.chat, '*❌ Error al consultar la API de MediaFire.*', m)
  }
}

handler.help = ['mediafiresearch <texto>']
handler.tags = ['search']
handler.command = ['mediafiresearch', 'mfse', 'mfsearch']
handler.group = true

export default handler